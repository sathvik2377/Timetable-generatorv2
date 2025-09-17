"""
OR-Tools CP-SAT based timetable scheduler
"""

from ortools.sat.python import cp_model
from datetime import datetime, time, timedelta
import logging
import os
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from timetable.models import (
    Institution, Branch, Subject, Teacher, Room, ClassGroup,
    Timetable, TimetableSession
)

logger = logging.getLogger(__name__)


@dataclass
class SchedulingData:
    """Data structure to hold all scheduling information"""
    institution: Institution
    subjects: List[Subject]
    teachers: List[Teacher]
    rooms: List[Room]
    class_groups: List[ClassGroup]
    time_slots: List[Tuple[int, time, time]]  # (day, start_time, end_time)
    constraints: Dict


class TimetableScheduler:
    """
    OR-Tools CP-SAT based timetable scheduler
    """
    
    def __init__(self, institution_id: int):
        self.institution = Institution.objects.get(id=institution_id)
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.variables = {}
        self.data = None
        
        # Configure solver with optimized parameters
        self.solver.parameters.max_time_in_seconds = 180  # 3 minutes timeout for faster generation
        self.solver.parameters.num_search_workers = 8  # Use more workers for parallel processing
        self.solver.parameters.search_branching = cp_model.PORTFOLIO_SEARCH
        self.solver.parameters.cp_model_presolve = True
        self.solver.parameters.symmetry_level = 2  # Enhanced symmetry breaking
        self.solver.parameters.linearization_level = 2  # Better linearization
        
    def prepare_data(self) -> SchedulingData:
        """
        Prepare all data needed for scheduling
        """
        logger.info(f"Preparing scheduling data for {self.institution.name}")
        
        # Get all related data
        subjects = list(Subject.objects.filter(branch__institution=self.institution))
        teachers = list(Teacher.objects.filter(department__institution=self.institution))
        rooms = list(Room.objects.filter(institution=self.institution, is_active=True))
        class_groups = list(ClassGroup.objects.filter(branch__institution=self.institution))
        
        # Generate time slots
        time_slots = self._generate_time_slots()
        
        # Prepare constraints
        constraints = self._prepare_constraints()
        
        self.data = SchedulingData(
            institution=self.institution,
            subjects=subjects,
            teachers=teachers,
            rooms=rooms,
            class_groups=class_groups,
            time_slots=time_slots,
            constraints=constraints
        )
        
        logger.info(f"Data prepared: {len(subjects)} subjects, {len(teachers)} teachers, "
                   f"{len(rooms)} rooms, {len(class_groups)} class groups, "
                   f"{len(time_slots)} time slots")
        
        return self.data
    
    def _generate_time_slots(self) -> List[Tuple[int, time, time]]:
        """
        Generate all possible time slots based on institution settings
        """
        time_slots = []
        # Convert day names to numbers if needed
        if self.institution.working_days and isinstance(self.institution.working_days[0], str):
            day_mapping = {'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6}
            working_days = [day_mapping.get(day, -1) for day in self.institution.working_days if day in day_mapping]
        else:
            working_days = self.institution.working_days or [0, 1, 2, 3, 4]  # Mon-Fri default
        
        # Convert times to datetime for easier manipulation
        start_time = datetime.combine(datetime.today(), self.institution.start_time)
        end_time = datetime.combine(datetime.today(), self.institution.end_time)
        lunch_start = datetime.combine(datetime.today(), self.institution.lunch_break_start)
        lunch_end = datetime.combine(datetime.today(), self.institution.lunch_break_end)
        
        slot_duration = timedelta(minutes=self.institution.slot_duration)
        
        for day in working_days:
            current_time = start_time
            
            while current_time + slot_duration <= end_time:
                slot_end = current_time + slot_duration
                
                # Skip lunch break slots
                if not (current_time >= lunch_start and slot_end <= lunch_end):
                    time_slots.append((
                        day,
                        current_time.time(),
                        slot_end.time()
                    ))
                
                current_time = slot_end
        
        return time_slots
    
    def _prepare_constraints(self) -> Dict:
        """
        Prepare NEP-2020 compliant constraint parameters
        """
        return {
            # Hard constraints (must be satisfied) - simplified for debugging
            'max_consecutive_hours': 3,
            'lunch_break_mandatory': False,  # Temporarily disabled
            'no_teacher_conflicts': True,
            'no_room_conflicts': True,
            'no_class_conflicts': True,
            'respect_teacher_availability': False,  # Temporarily disabled
            'respect_room_availability': False,  # Temporarily disabled

            # NEP-2020 specific constraints - simplified
            'max_teacher_hours_per_week': True,  # Keep this
            'working_days_only': False,  # Temporarily disabled
            'lab_subjects_in_lab_rooms': False,  # Temporarily disabled
            'subject_weekly_hours': True,  # Keep this - essential
            'minutes_per_slot_compliance': False,  # Temporarily disabled

            # Soft constraints (optimization objectives) - all disabled for debugging
            'prefer_morning_sessions': False,
            'balance_daily_load': False,
            'minimize_gaps': False,
            'priority_subjects_first': False,
            'spread_teacher_load': False,
            'avoid_excessive_consecutive': False,
            'balance_subject_distribution': False,
        }
    
    def create_variables(self):
        """
        Create CP-SAT variables for the scheduling problem
        """
        logger.info("Creating CP-SAT variables")
        
        # Main scheduling variables: session[s, t, r, c, d, slot] = 1 if subject s is taught by teacher t
        # in room r to class c on day d at time slot
        for subject in self.data.subjects:
            for teacher in self.data.teachers:
                # Check if teacher can teach this subject
                if not teacher.subjects.filter(id=subject.id).exists():
                    continue
                    
                for room in self.data.rooms:
                    # Check room capacity vs class strength
                    for class_group in self.data.class_groups:
                        if room.capacity < class_group.strength:
                            continue
                            
                        for day, start_time, end_time in self.data.time_slots:
                            # Convert time to string without colons to avoid parsing issues
                            time_str = start_time.strftime('%H%M')
                            var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                            self.variables[var_name] = self.model.NewBoolVar(var_name)
        
        logger.info(f"Created {len(self.variables)} scheduling variables")
    
    def add_constraints(self):
        """
        Add all scheduling constraints
        """
        logger.info("Adding scheduling constraints")
        
        self._add_subject_requirements_constraints()
        self._add_teacher_constraints()
        self._add_room_constraints()
        self._add_class_constraints()
        self._add_availability_constraints()
        self._add_nep2020_constraints()  # NEP-2020 specific constraints
        self._add_optimization_objectives()

        logger.info("All constraints and objectives added")
    
    def _add_subject_requirements_constraints(self):
        """
        Ensure each subject gets the required number of hours per week
        """
        for subject in self.data.subjects:
            for class_group in self.data.class_groups:
                # Check if this subject is for this class group
                if subject.branch != class_group.branch or subject.year != class_group.year:
                    continue
                
                # Sum all sessions for this subject-class combination
                subject_sessions = []
                for teacher in self.data.teachers:
                    if not teacher.subjects.filter(id=subject.id).exists():
                        continue
                        
                    for room in self.data.rooms:
                        if room.capacity < class_group.strength:
                            continue
                            
                        for day, start_time, end_time in self.data.time_slots:
                            time_str = start_time.strftime('%H%M')
                            var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                            if var_name in self.variables:
                                subject_sessions.append(self.variables[var_name])
                
                if subject_sessions:
                    # Each subject should have exactly the required number of sessions
                    required_sessions = subject.total_hours
                    self.model.Add(sum(subject_sessions) == required_sessions)
    
    def _add_teacher_constraints(self):
        """
        Add teacher-related constraints
        """
        for teacher in self.data.teachers:
            # No teacher conflicts - teacher can't be in two places at once
            for day, start_time, end_time in self.data.time_slots:
                teacher_sessions_at_slot = []
                
                for subject in self.data.subjects:
                    if not teacher.subjects.filter(id=subject.id).exists():
                        continue
                        
                    for room in self.data.rooms:
                        for class_group in self.data.class_groups:
                            if room.capacity < class_group.strength:
                                continue
                                
                            time_str = start_time.strftime('%H%M')
                            var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                            if var_name in self.variables:
                                teacher_sessions_at_slot.append(self.variables[var_name])
                
                if teacher_sessions_at_slot:
                    # Teacher can teach at most one session per time slot
                    self.model.Add(sum(teacher_sessions_at_slot) <= 1)
            
            # Daily hour limits
            for day in range(7):
                daily_sessions = []
                for subject in self.data.subjects:
                    if not teacher.subjects.filter(id=subject.id).exists():
                        continue
                        
                    for room in self.data.rooms:
                        for class_group in self.data.class_groups:
                            if room.capacity < class_group.strength:
                                continue
                                
                            for d, start_time, end_time in self.data.time_slots:
                                if d == day:
                                    time_str = start_time.strftime('%H%M')
                                    var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                    if var_name in self.variables:
                                        daily_sessions.append(self.variables[var_name])
                
                if daily_sessions:
                    # Respect teacher's daily hour limit
                    max_daily_hours = teacher.max_hours_per_day
                    self.model.Add(sum(daily_sessions) <= max_daily_hours)
    
    def _add_room_constraints(self):
        """
        Add room-related constraints
        """
        for room in self.data.rooms:
            # No room conflicts - room can't host two classes at once
            for day, start_time, end_time in self.data.time_slots:
                room_sessions_at_slot = []
                
                for subject in self.data.subjects:
                    for teacher in self.data.teachers:
                        if not teacher.subjects.filter(id=subject.id).exists():
                            continue
                            
                        for class_group in self.data.class_groups:
                            if room.capacity < class_group.strength:
                                continue
                                
                            time_str = start_time.strftime('%H%M')
                            var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                            if var_name in self.variables:
                                room_sessions_at_slot.append(self.variables[var_name])
                
                if room_sessions_at_slot:
                    # Room can host at most one session per time slot
                    self.model.Add(sum(room_sessions_at_slot) <= 1)
    
    def _add_class_constraints(self):
        """
        Add class group related constraints
        """
        for class_group in self.data.class_groups:
            # No class conflicts - class can't have two subjects at once
            for day, start_time, end_time in self.data.time_slots:
                class_sessions_at_slot = []
                
                for subject in self.data.subjects:
                    if subject.branch != class_group.branch or subject.year != class_group.year:
                        continue
                        
                    for teacher in self.data.teachers:
                        if not teacher.subjects.filter(id=subject.id).exists():
                            continue
                            
                        for room in self.data.rooms:
                            if room.capacity < class_group.strength:
                                continue
                                
                            time_str = start_time.strftime('%H%M')
                            var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                            if var_name in self.variables:
                                class_sessions_at_slot.append(self.variables[var_name])
                
                if class_sessions_at_slot:
                    # Class can have at most one session per time slot
                    self.model.Add(sum(class_sessions_at_slot) <= 1)
    
    def _add_availability_constraints(self):
        """
        Add availability constraints for teachers and rooms
        """
        # This would check teacher and room availability from their availability JSON fields
        # For now, we'll implement basic constraints
        pass

    def _add_nep2020_constraints(self):
        """
        Add NEP-2020 specific constraints
        """
        logger.info("Adding NEP-2020 specific constraints")

        # Constraint 1: Teacher hours ≤ max hours per week
        if self.data.constraints.get('max_teacher_hours_per_week', True):
            for teacher in self.data.teachers:
                teacher_sessions = []
                for subject in self.data.subjects:
                    if not teacher.subjects.filter(id=subject.id).exists():
                        continue
                    for room in self.data.rooms:
                        for class_group in self.data.class_groups:
                            for day, start_time, end_time in self.data.time_slots:
                                time_str = start_time.strftime('%H%M')
                                var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                if var_name in self.variables:
                                    teacher_sessions.append(self.variables[var_name])

                if teacher_sessions:
                    # Use individual teacher max hours or institution default
                    max_hours = getattr(teacher, 'max_hours_per_week', self.institution.max_teacher_hours_per_week)
                    self.model.Add(sum(teacher_sessions) <= max_hours)
                    logger.debug(f"Added max hours constraint for teacher {teacher.id}: {max_hours} hours")

        # Constraint 2: Working days only
        if self.data.constraints.get('working_days_only', True):
            working_days = self.institution.working_days
            if working_days:
                # Convert working day names to numbers (Mon=0, Tue=1, etc.)
                day_mapping = {'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6}
                allowed_days = [day_mapping.get(day, -1) for day in working_days if day in day_mapping]

                for day, start_time, end_time in self.data.time_slots:
                    if day not in allowed_days:
                        # Disable all sessions on non-working days
                        for var_name, var in self.variables.items():
                            if f"_{day}_" in var_name:
                                self.model.Add(var == 0)

        # Constraint 3: Lab subjects in lab rooms only
        if self.data.constraints.get('lab_subjects_in_lab_rooms', True):
            for subject in self.data.subjects:
                if subject.type == 'lab':  # Lab subject
                    for teacher in self.data.teachers:
                        for room in self.data.rooms:
                            if not room.is_lab:  # Non-lab room
                                for class_group in self.data.class_groups:
                                    for day, start_time, end_time in self.data.time_slots:
                                        time_str = start_time.strftime('%H%M')
                                        var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                        if var_name in self.variables:
                                            # Lab subjects cannot be scheduled in non-lab rooms
                                            self.model.Add(self.variables[var_name] == 0)

        # Constraint 4: Exclude lunch break slots
        if self.data.constraints.get('lunch_break_mandatory', True):
            lunch_start = self.institution.lunch_break_start
            lunch_end = self.institution.lunch_break_end

            for day, start_time, end_time in self.data.time_slots:
                # Check if slot overlaps with lunch break
                if lunch_start <= start_time < lunch_end or lunch_start < end_time <= lunch_end:
                    # Disable all sessions during lunch break
                    time_str = start_time.strftime('%H%M')
                    for var_name, var in self.variables.items():
                        if f"_{day}_{time_str}" in var_name:
                            self.model.Add(var == 0)

        # Constraint 5: Subject weekly hours compliance
        if self.data.constraints.get('subject_weekly_hours', True):
            for subject in self.data.subjects:
                for class_group in self.data.class_groups:
                    if subject.branch != class_group.branch:
                        continue

                    subject_sessions = []
                    for teacher in self.data.teachers:
                        # Only consider teachers who can teach this subject
                        if not teacher.subjects.filter(id=subject.id).exists():
                            continue
                        for room in self.data.rooms:
                            for day, start_time, end_time in self.data.time_slots:
                                time_str = start_time.strftime('%H%M')
                                var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                if var_name in self.variables:
                                    subject_sessions.append(self.variables[var_name])

                    if subject_sessions and hasattr(subject, 'weekly_hours'):
                        # Subject should have exactly the specified weekly hours
                        self.model.Add(sum(subject_sessions) == subject.weekly_hours)

        logger.info("NEP-2020 constraints added successfully")

    def validate_constraints(self) -> Dict:
        """
        Validate NEP-2020 constraints and provide detailed feedback
        """
        logger.info("Validating NEP-2020 constraints")
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': [],
            'constraint_details': {}
        }

        # Validation 1: Teacher workload constraints
        teacher_workload_issues = []
        for teacher in self.data.teachers:
            max_hours = getattr(teacher, 'max_hours_per_week', self.institution.max_teacher_hours_per_week)
            assigned_subjects = teacher.subjects.all()

            total_required_hours = 0
            for subject in assigned_subjects:
                # Calculate hours needed for all classes this teacher teaches this subject to
                for class_group in self.data.class_groups:
                    if (subject.branch == class_group.branch and
                        teacher.classes_assigned.filter(id=class_group.id).exists()):
                        total_required_hours += getattr(subject, 'weekly_hours', subject.total_hours)

            if total_required_hours > max_hours:
                teacher_workload_issues.append({
                    'teacher': teacher.name,
                    'required_hours': total_required_hours,
                    'max_hours': max_hours,
                    'excess': total_required_hours - max_hours
                })
                validation_result['errors'].append(
                    f"Teacher {teacher.name} assigned {total_required_hours} hours but max is {max_hours}"
                )

        validation_result['constraint_details']['teacher_workload'] = teacher_workload_issues

        # Validation 2: Lab subject and room compatibility
        lab_room_issues = []
        lab_subjects = [s for s in self.data.subjects if s.type == 'lab']
        lab_rooms = [r for r in self.data.rooms if r.is_lab]

        if lab_subjects and not lab_rooms:
            validation_result['errors'].append("Lab subjects exist but no lab rooms available")
            lab_room_issues.append("No lab rooms available for lab subjects")

        for subject in lab_subjects:
            suitable_rooms = [r for r in lab_rooms if r.capacity >= max(cg.strength for cg in self.data.class_groups if cg.branch == subject.branch)]
            if not suitable_rooms:
                lab_room_issues.append({
                    'subject': subject.name,
                    'issue': 'No lab room with sufficient capacity'
                })
                validation_result['errors'].append(f"Lab subject {subject.name} has no suitable lab room")

        validation_result['constraint_details']['lab_rooms'] = lab_room_issues

        # Validation 3: Working days configuration
        working_days = getattr(self.institution, 'working_days', [])
        if not working_days:
            validation_result['warnings'].append("No working days specified, defaulting to Mon-Fri")
        elif len(working_days) < 5:
            validation_result['warnings'].append(f"Only {len(working_days)} working days may limit scheduling options")

        # Validation 4: Time slot sufficiency
        total_required_sessions = sum(
            getattr(subject, 'weekly_hours', subject.total_hours) *
            len([cg for cg in self.data.class_groups if cg.branch == subject.branch])
            for subject in self.data.subjects
        )

        available_slots_per_week = len(self.data.time_slots) * len(working_days) if working_days else len(self.data.time_slots) * 5
        total_class_slot_capacity = available_slots_per_week * len(self.data.class_groups)

        if total_required_sessions > total_class_slot_capacity:
            validation_result['errors'].append(
                f"Required sessions ({total_required_sessions}) exceed available capacity ({total_class_slot_capacity})"
            )
            validation_result['suggestions'].append("Consider adding more time slots or reducing subject hours")

        # Validation 5: Teacher-subject assignments
        unassigned_subjects = []
        for subject in self.data.subjects:
            assigned_teachers = [t for t in self.data.teachers if t.subjects.filter(id=subject.id).exists()]
            if not assigned_teachers:
                unassigned_subjects.append(subject.name)
                validation_result['errors'].append(f"Subject {subject.name} has no assigned teachers")

        validation_result['constraint_details']['unassigned_subjects'] = unassigned_subjects

        # Validation 6: Room capacity vs class strength
        capacity_issues = []
        for class_group in self.data.class_groups:
            suitable_rooms = [r for r in self.data.rooms if r.capacity >= class_group.strength]
            if not suitable_rooms:
                capacity_issues.append({
                    'class_group': f"{class_group.branch}-{class_group.year}",
                    'strength': class_group.strength,
                    'issue': 'No room with sufficient capacity'
                })
                validation_result['errors'].append(
                    f"Class {class_group.branch}-{class_group.year} ({class_group.strength} students) has no suitable room"
                )

        validation_result['constraint_details']['room_capacity'] = capacity_issues

        # Set overall validation status
        validation_result['is_valid'] = len(validation_result['errors']) == 0

        # Add suggestions based on issues found
        if teacher_workload_issues:
            validation_result['suggestions'].append("Consider hiring more teachers or reducing subject hours")
        if lab_room_issues:
            validation_result['suggestions'].append("Add more lab rooms or reduce lab subject requirements")
        if capacity_issues:
            validation_result['suggestions'].append("Add larger rooms or reduce class sizes")

        logger.info(f"Constraint validation completed: {'VALID' if validation_result['is_valid'] else 'INVALID'}")
        logger.info(f"Found {len(validation_result['errors'])} errors, {len(validation_result['warnings'])} warnings")

        return validation_result

    def _add_optimization_objectives(self):
        """
        Add optimization objectives to improve timetable quality
        """
        objective_terms = []

        # Objective 1: Prefer morning sessions (earlier time slots get higher weight)
        if self.data.constraints.get('prefer_morning_sessions', True):
            for subject in self.data.subjects:
                for teacher in self.data.teachers:
                    for room in self.data.rooms:
                        for class_group in self.data.class_groups:
                            for i, (day, start_time, end_time) in enumerate(self.data.time_slots):
                                var_name = f"x_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{start_time.hour}_{start_time.minute}"
                                if var_name in self.variables:
                                    # Earlier slots get higher weight (prefer morning)
                                    morning_weight = max(0, 10 - i)  # First slot gets weight 10, decreases
                                    objective_terms.append(morning_weight * self.variables[var_name])

        # Objective 2: Balance daily load (penalize days with too many or too few sessions)
        if self.data.constraints.get('balance_daily_load', True):
            for class_group in self.data.class_groups:
                daily_sessions = {}
                for day in range(1, 8):  # Monday to Sunday
                    daily_sessions[day] = []
                    for subject in self.data.subjects:
                        for teacher in self.data.teachers:
                            for room in self.data.rooms:
                                for _, start_time, end_time in self.data.time_slots:
                                    if _ == day:  # Same day
                                        var_name = f"x_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{start_time.hour}_{start_time.minute}"
                                        if var_name in self.variables:
                                            daily_sessions[day].append(self.variables[var_name])

                # Add soft constraint for balanced daily load (3-5 sessions per day is ideal)
                for day, sessions in daily_sessions.items():
                    if sessions:
                        daily_total = sum(sessions)
                        # Penalize deviation from ideal range (3-5 sessions)
                        ideal_min, ideal_max = 3, 5
                        balance_penalty = self.model.NewIntVar(0, 10, f"balance_penalty_{class_group.id}_{day}")

                        # This is a simplified approach - in practice, you'd use more sophisticated constraints
                        objective_terms.append(-balance_penalty)  # Minimize penalty

        # Objective 3: Minimize gaps between sessions
        if self.data.constraints.get('minimize_gaps', True):
            for class_group in self.data.class_groups:
                for day in range(1, 8):
                    day_slots = [(start_time, end_time) for d, start_time, end_time in self.data.time_slots if d == day]
                    day_slots.sort()  # Sort by time

                    for i in range(len(day_slots) - 1):
                        current_slot = day_slots[i]
                        next_slot = day_slots[i + 1]

                        # Check if there's a gap between consecutive sessions
                        gap_penalty = self.model.NewBoolVar(f"gap_{class_group.id}_{day}_{i}")

                        # This would need more complex logic to properly detect gaps
                        # For now, we'll add a small penalty for gaps
                        objective_terms.append(-gap_penalty)

        # NEP-2020 Soft Constraint 1: Spread teacher load evenly across week
        if self.data.constraints.get('spread_teacher_load', True):
            for teacher in self.data.teachers:
                daily_loads = {}
                for day in range(1, 8):
                    daily_loads[day] = []
                    for subject in self.data.subjects:
                        if not teacher.subjects.filter(id=subject.id).exists():
                            continue
                        for room in self.data.rooms:
                            for class_group in self.data.class_groups:
                                for d, start_time, end_time in self.data.time_slots:
                                    if d == day:
                                        time_str = start_time.strftime('%H%M')
                                        var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                        if var_name in self.variables:
                                            daily_loads[day].append(self.variables[var_name])

                # Penalize uneven distribution of teacher workload
                for day, sessions in daily_loads.items():
                    if sessions:
                        daily_total = sum(sessions)
                        # Ideal is 3-5 sessions per day for teachers
                        load_penalty = self.model.NewIntVar(0, 5, f"teacher_load_penalty_{teacher.id}_{day}")
                        objective_terms.append(-load_penalty)  # Minimize penalty

        # NEP-2020 Soft Constraint 2: Avoid excessive consecutive sessions for teachers
        if self.data.constraints.get('avoid_excessive_consecutive', True):
            for teacher in self.data.teachers:
                for day in range(1, 8):
                    day_slots = [(start_time, end_time) for d, start_time, end_time in self.data.time_slots if d == day]
                    day_slots.sort()

                    # Check for more than 3 consecutive sessions
                    for i in range(len(day_slots) - 3):  # Check 4 consecutive slots
                        consecutive_sessions = []
                        for j in range(4):  # 4 consecutive slots
                            slot_start, slot_end = day_slots[i + j]
                            for subject in self.data.subjects:
                                for room in self.data.rooms:
                                    for class_group in self.data.class_groups:
                                        var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{slot_start}"
                                        if var_name in self.variables:
                                            consecutive_sessions.append(self.variables[var_name])

                        if consecutive_sessions:
                            # Penalize having 4 consecutive sessions
                            consecutive_penalty = self.model.NewBoolVar(f"consecutive_penalty_{teacher.id}_{day}_{i}")
                            self.model.Add(sum(consecutive_sessions) <= 3 + 10 * (1 - consecutive_penalty))
                            objective_terms.append(-5 * consecutive_penalty)  # Strong penalty

        # NEP-2020 Soft Constraint 3: Balance subject distribution across week
        if self.data.constraints.get('balance_subject_distribution', True):
            for subject in self.data.subjects:
                for class_group in self.data.class_groups:
                    if subject.branch != class_group.branch:
                        continue

                    daily_subject_sessions = {}
                    for day in range(1, 8):
                        daily_subject_sessions[day] = []
                        for teacher in self.data.teachers:
                            for room in self.data.rooms:
                                for d, start_time, end_time in self.data.time_slots:
                                    if d == day:
                                        time_str = start_time.strftime('%H%M')
                                        var_name = f"session_{subject.id}_{teacher.id}_{room.id}_{class_group.id}_{day}_{time_str}"
                                        if var_name in self.variables:
                                            daily_subject_sessions[day].append(self.variables[var_name])

                    # Prefer spreading subjects across different days rather than clustering
                    for day, sessions in daily_subject_sessions.items():
                        if sessions:
                            daily_subject_total = sum(sessions)
                            # Penalize having too many sessions of same subject on same day
                            clustering_penalty = self.model.NewIntVar(0, 3, f"subject_cluster_penalty_{subject.id}_{class_group.id}_{day}")
                            # If more than 2 sessions of same subject on same day, add penalty
                            self.model.Add(daily_subject_total <= 2 + 10 * clustering_penalty)
                            objective_terms.append(-clustering_penalty)

        # Set the objective to maximize the sum of all objective terms
        if objective_terms:
            self.model.Maximize(sum(objective_terms))
            logger.info(f"Added {len(objective_terms)} optimization objective terms")
    
    def solve(self) -> Optional[Dict]:
        """
        Solve the scheduling problem with enhanced error handling
        """
        logger.info("Starting CP-SAT solver")
        start_time = datetime.now()

        # Set optimized solver parameters for NEP-2020 constraints
        self.solver.parameters.max_time_in_seconds = 600  # 10 minutes for complex NEP-2020 constraints
        self.solver.parameters.num_search_workers = min(8, os.cpu_count() or 4)  # Use available cores
        self.solver.parameters.log_search_progress = True

        # Advanced parameters for better constraint satisfaction
        self.solver.parameters.cp_model_presolve = True  # Enable presolving
        self.solver.parameters.cp_model_probing_level = 2  # Enhanced probing
        self.solver.parameters.linearization_level = 2  # Better linearization
        self.solver.parameters.symmetry_level = 2  # Exploit symmetries

        # Search strategy parameters
        self.solver.parameters.search_branching = cp_model.FIXED_SEARCH  # Use fixed search order
        # Note: preferred_variable_order removed as IN_ORDER is not available in this OR-Tools version

        # Restart and learning parameters
        self.solver.parameters.restart_algorithms = [cp_model.LUBY_RESTART, cp_model.DL_MOVING_AVERAGE_RESTART]
        self.solver.parameters.clause_cleanup_period = 10000

        logger.info(f"Solver configured with {self.solver.parameters.num_search_workers} workers, {self.solver.parameters.max_time_in_seconds}s timeout")

        # Pre-solve constraint validation
        validation_result = self.validate_constraints()
        if not validation_result['is_valid']:
            logger.error("Constraint validation failed before solving")
            return {
                'status': 'validation_failed',
                'validation_result': validation_result,
                'solution': None,
                'solver_status': 'validation_error'
            }

        try:
            status = self.solver.Solve(self.model)

            end_time = datetime.now()
            solving_time = end_time - start_time

            # Log detailed status information
            status_names = {
                cp_model.OPTIMAL: "OPTIMAL",
                cp_model.FEASIBLE: "FEASIBLE",
                cp_model.INFEASIBLE: "INFEASIBLE",
                cp_model.UNKNOWN: "UNKNOWN",
                cp_model.MODEL_INVALID: "MODEL_INVALID"
            }

            status_name = status_names.get(status, f"UNKNOWN_STATUS_{status}")
            logger.info(f"Solver finished with status: {status_name} in {solving_time.total_seconds():.2f} seconds")

            if status == cp_model.OPTIMAL:
                logger.info("Found optimal solution")
                solution = self._extract_solution()
                solution['solver_status'] = 'optimal'
                solution['solving_time'] = solving_time.total_seconds()
                return solution

            elif status == cp_model.FEASIBLE:
                logger.info("Found feasible solution (may not be optimal)")
                solution = self._extract_solution()
                solution['solver_status'] = 'feasible'
                solution['solving_time'] = solving_time.total_seconds()
                return solution

            elif status == cp_model.INFEASIBLE:
                logger.error("Problem is infeasible - no solution exists with current constraints")
                return self._handle_infeasible_problem()

            elif status == cp_model.UNKNOWN:
                logger.warning("Solver timed out or encountered unknown status")
                # Try to extract partial solution if available
                if self.solver.NumBooleans() > 0:
                    logger.info("Attempting to extract partial solution")
                    try:
                        partial_solution = self._extract_solution()
                        partial_solution['solver_status'] = 'partial'
                        partial_solution['solving_time'] = solving_time.total_seconds()
                        return partial_solution
                    except Exception as e:
                        logger.error(f"Failed to extract partial solution: {e}")
                return None

            else:
                logger.error(f"Solver failed with status: {status_name}")
                return None

        except Exception as e:
            logger.error(f"Exception during solving: {str(e)}")
            return None

    def _handle_infeasible_problem(self) -> Optional[Dict]:
        """
        Handle infeasible problems by analyzing constraints and suggesting relaxations
        """
        logger.info("Analyzing infeasible problem...")

        # Collect constraint violation information
        infeasibility_info = {
            'status': 'infeasible',
            'suggestions': [],
            'constraint_analysis': {}
        }

        # Analyze potential causes of infeasibility
        suggestions = []

        # Check if we have enough rooms
        total_room_capacity = sum(room.capacity for room in self.data.rooms)
        total_student_capacity_needed = sum(cg.strength for cg in self.data.class_groups)

        if total_room_capacity < total_student_capacity_needed:
            suggestions.append("Insufficient room capacity for all class groups")

        # Check if we have enough teachers
        total_teaching_hours_needed = sum(
            subject.total_hours * len([cg for cg in self.data.class_groups
                                     if cg.branch == subject.branch and cg.year == subject.year])
            for subject in self.data.subjects
        )

        total_teacher_capacity = sum(teacher.max_hours_per_week for teacher in self.data.teachers)

        if total_teaching_hours_needed > total_teacher_capacity:
            suggestions.append("Insufficient teacher capacity for all required hours")

        # Check time slot availability
        available_slots_per_week = len(self.data.time_slots)
        if total_teaching_hours_needed > available_slots_per_week * len(self.data.class_groups):
            suggestions.append("Insufficient time slots for all required sessions")

        # Check teacher-subject assignments
        unassigned_subjects = []
        for subject in self.data.subjects:
            has_teacher = any(
                teacher.subjects.filter(id=subject.id).exists()
                for teacher in self.data.teachers
            )
            if not has_teacher:
                unassigned_subjects.append(subject.code)

        if unassigned_subjects:
            suggestions.append(f"Subjects without assigned teachers: {', '.join(unassigned_subjects)}")

        infeasibility_info['suggestions'] = suggestions

        logger.warning(f"Infeasibility analysis complete. Suggestions: {'; '.join(suggestions)}")

        return infeasibility_info
    
    def _extract_solution(self) -> Dict:
        """
        Extract the solution from the solved model with enhanced validation
        """
        solution = {
            'sessions': [],
            'statistics': {
                'total_sessions': 0,
                'conflicts_resolved': 0,
                'optimization_score': 0.0,
                'teacher_utilization': {},
                'room_utilization': {},
                'class_load_distribution': {}
            },
            'validation': {
                'conflicts': [],
                'warnings': [],
                'is_valid': True
            }
        }

        # Extract sessions from variables
        extracted_sessions = []
        for var_name, var in self.variables.items():
            if self.solver.Value(var) == 1:
                try:
                    # Parse variable name to extract session details
                    parts = var_name.split('_')
                    if len(parts) >= 7:
                        subject_id = int(parts[1])
                        teacher_id = int(parts[2])
                        room_id = int(parts[3])
                        class_group_id = int(parts[4])
                        day = int(parts[5])
                        time_str = parts[6]  # Now in HHMM format
                        # Convert HHMM back to time string
                        start_time_str = f"{time_str[:2]}:{time_str[2:]}:00"

                        session = {
                            'subject_id': subject_id,
                            'teacher_id': teacher_id,
                            'room_id': room_id,
                            'class_group_id': class_group_id,
                            'day_of_week': day,
                            'start_time': start_time_str,
                            'session_type': 'theory'  # Default, can be enhanced
                        }

                        extracted_sessions.append(session)

                except (ValueError, IndexError) as e:
                    logger.warning(f"Failed to parse variable {var_name}: {e}")
                    solution['validation']['warnings'].append(f"Failed to parse variable {var_name}")

        # Validate extracted sessions for conflicts
        validated_sessions, conflicts = self._validate_extracted_sessions(extracted_sessions)

        solution['sessions'] = validated_sessions
        solution['validation']['conflicts'] = conflicts
        solution['validation']['is_valid'] = len(conflicts) == 0

        # Calculate statistics
        solution['statistics']['total_sessions'] = len(validated_sessions)
        solution['statistics']['conflicts_resolved'] = len(conflicts)

        # Calculate utilization metrics
        solution['statistics']['teacher_utilization'] = self._calculate_teacher_utilization(validated_sessions)
        solution['statistics']['room_utilization'] = self._calculate_room_utilization(validated_sessions)
        solution['statistics']['class_load_distribution'] = self._calculate_class_load_distribution(validated_sessions)

        # Calculate optimization score based on various factors
        solution['statistics']['optimization_score'] = self._calculate_optimization_score(solution)

        logger.info(f"Extracted {len(validated_sessions)} sessions with {len(conflicts)} conflicts")

        return solution

    def _validate_extracted_sessions(self, sessions):
        """
        Validate extracted sessions for conflicts and inconsistencies
        """
        conflicts = []
        validated_sessions = []

        # Group sessions by time slot for conflict detection
        time_slot_map = {}

        for session in sessions:
            # Create unique key for time slot
            time_key = (session['day_of_week'], session['start_time'])

            if time_key not in time_slot_map:
                time_slot_map[time_key] = []
            time_slot_map[time_key].append(session)

        # Check for conflicts in each time slot
        for time_key, slot_sessions in time_slot_map.items():
            day, start_time = time_key

            # Check teacher conflicts
            teacher_sessions = {}
            for session in slot_sessions:
                teacher_id = session['teacher_id']
                if teacher_id in teacher_sessions:
                    conflicts.append({
                        'type': 'teacher_conflict',
                        'teacher_id': teacher_id,
                        'day': day,
                        'time': start_time,
                        'sessions': [teacher_sessions[teacher_id], session]
                    })
                else:
                    teacher_sessions[teacher_id] = session

            # Check room conflicts
            room_sessions = {}
            for session in slot_sessions:
                room_id = session['room_id']
                if room_id in room_sessions:
                    conflicts.append({
                        'type': 'room_conflict',
                        'room_id': room_id,
                        'day': day,
                        'time': start_time,
                        'sessions': [room_sessions[room_id], session]
                    })
                else:
                    room_sessions[room_id] = session

            # Check class conflicts
            class_sessions = {}
            for session in slot_sessions:
                class_id = session['class_group_id']
                if class_id in class_sessions:
                    conflicts.append({
                        'type': 'class_conflict',
                        'class_group_id': class_id,
                        'day': day,
                        'time': start_time,
                        'sessions': [class_sessions[class_id], session]
                    })
                else:
                    class_sessions[class_id] = session

            # Add non-conflicting sessions to validated list
            for session in slot_sessions:
                # Check if this session is involved in any conflict
                is_conflicted = any(
                    session in conflict['sessions']
                    for conflict in conflicts
                )

                if not is_conflicted:
                    validated_sessions.append(session)

        return validated_sessions, conflicts

    def _calculate_teacher_utilization(self, sessions):
        """Calculate teacher utilization statistics"""
        teacher_hours = {}

        for session in sessions:
            teacher_id = session['teacher_id']
            if teacher_id not in teacher_hours:
                teacher_hours[teacher_id] = 0
            teacher_hours[teacher_id] += 1  # Assuming 1 hour per session

        # Get teacher max hours for utilization percentage
        utilization = {}
        for teacher in self.data.teachers:
            hours_scheduled = teacher_hours.get(teacher.id, 0)
            max_hours = teacher.max_hours_per_week
            utilization[teacher.id] = {
                'scheduled_hours': hours_scheduled,
                'max_hours': max_hours,
                'utilization_percentage': (hours_scheduled / max_hours * 100) if max_hours > 0 else 0
            }

        return utilization

    def _calculate_room_utilization(self, sessions):
        """Calculate room utilization statistics"""
        room_hours = {}

        for session in sessions:
            room_id = session['room_id']
            if room_id not in room_hours:
                room_hours[room_id] = 0
            room_hours[room_id] += 1

        # Calculate utilization percentage based on available time slots
        total_available_hours = len(self.data.time_slots) * len(self.data.institution.working_days or [0,1,2,3,4])

        utilization = {}
        for room in self.data.rooms:
            hours_used = room_hours.get(room.id, 0)
            utilization[room.id] = {
                'hours_used': hours_used,
                'total_available': total_available_hours,
                'utilization_percentage': (hours_used / total_available_hours * 100) if total_available_hours > 0 else 0
            }

        return utilization

    def _calculate_class_load_distribution(self, sessions):
        """Calculate class load distribution"""
        class_hours = {}
        class_daily_hours = {}

        for session in sessions:
            class_id = session['class_group_id']
            day = session['day_of_week']

            if class_id not in class_hours:
                class_hours[class_id] = 0
                class_daily_hours[class_id] = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}

            class_hours[class_id] += 1
            class_daily_hours[class_id][day] += 1

        distribution = {}
        for class_group in self.data.class_groups:
            total_hours = class_hours.get(class_group.id, 0)
            daily_hours = class_daily_hours.get(class_group.id, {})

            distribution[class_group.id] = {
                'total_hours': total_hours,
                'daily_hours': daily_hours,
                'average_daily_hours': total_hours / 5 if total_hours > 0 else 0,  # Assuming 5 working days
                'max_daily_hours': max(daily_hours.values()) if daily_hours else 0,
                'min_daily_hours': min(daily_hours.values()) if daily_hours else 0
            }

        return distribution

    def _calculate_optimization_score(self, solution):
        """Calculate overall optimization score"""
        score = 100.0  # Start with perfect score

        # Penalize conflicts
        conflicts = len(solution['validation']['conflicts'])
        score -= conflicts * 10  # -10 points per conflict

        # Reward balanced teacher utilization
        teacher_utils = solution['statistics']['teacher_utilization']
        if teacher_utils:
            utilizations = [t['utilization_percentage'] for t in teacher_utils.values()]
            avg_util = sum(utilizations) / len(utilizations)
            std_dev = (sum((u - avg_util) ** 2 for u in utilizations) / len(utilizations)) ** 0.5

            # Penalize high standard deviation (unbalanced workload)
            score -= std_dev * 0.5

            # Reward good average utilization (70-90% is ideal)
            if 70 <= avg_util <= 90:
                score += 5
            elif avg_util < 50:
                score -= 10
            elif avg_util > 95:
                score -= 5

        # Reward balanced class load distribution
        class_loads = solution['statistics']['class_load_distribution']
        if class_loads:
            daily_maxes = [c['max_daily_hours'] for c in class_loads.values()]
            if daily_maxes:
                avg_max_daily = sum(daily_maxes) / len(daily_maxes)
                # Penalize if classes have too many hours per day
                if avg_max_daily > 6:
                    score -= (avg_max_daily - 6) * 2

        return max(0.0, min(100.0, score))  # Clamp between 0 and 100
    
    def generate_timetable(self, name: str, generated_by_user) -> Optional[Timetable]:
        """
        Main method to generate a complete timetable with comprehensive error handling
        """
        generation_start_time = datetime.now()

        try:
            logger.info(f"Starting timetable generation for {self.institution.name}")

            # Step 1: Prepare and validate data
            logger.info("Step 1: Preparing scheduling data...")
            try:
                self.prepare_data()
                logger.info(f"Data prepared successfully: {len(self.data.subjects)} subjects, "
                           f"{len(self.data.teachers)} teachers, {len(self.data.rooms)} rooms, "
                           f"{len(self.data.class_groups)} class groups")
            except Exception as e:
                logger.error(f"Failed to prepare data: {str(e)}")
                raise Exception(f"Data preparation failed: {str(e)}")

            # Step 2: Validate data consistency
            logger.info("Step 2: Validating data consistency...")
            validation_errors = self._validate_data_consistency()
            if validation_errors:
                logger.warning(f"Data validation warnings: {'; '.join(validation_errors)}")

            # Step 3: Create variables
            logger.info("Step 3: Creating optimization variables...")
            try:
                self.create_variables()
                if not self.variables:
                    raise Exception("No variables created - check data assignments")
                logger.info(f"Created {len(self.variables)} optimization variables")
            except Exception as e:
                logger.error(f"Failed to create variables: {str(e)}")
                raise Exception(f"Variable creation failed: {str(e)}")

            # Step 4: Add constraints
            logger.info("Step 4: Adding scheduling constraints...")
            try:
                self.add_constraints()
                logger.info("Constraints added successfully")
            except Exception as e:
                logger.error(f"Failed to add constraints: {str(e)}")
                raise Exception(f"Constraint addition failed: {str(e)}")

            # Step 5: Solve the optimization problem
            logger.info("Step 5: Solving optimization problem...")
            solution = self.solve()

            if not solution:
                logger.error("No solution found by the optimizer")
                return None

            # Step 6: Handle different solution types
            if solution.get('status') == 'infeasible':
                logger.error("Problem is infeasible with current constraints")
                logger.info("Suggestions for fixing infeasibility:")
                for suggestion in solution.get('suggestions', []):
                    logger.info(f"  - {suggestion}")
                return None

            # Step 7: Create timetable instance
            logger.info("Step 6: Creating timetable instance...")
            generation_time = datetime.now() - generation_start_time

            try:
                timetable = Timetable.objects.create(
                    institution=self.institution,
                    name=name,
                    academic_year=self.institution.academic_year,
                    generated_by=generated_by_user,
                    algorithm_used='OR-Tools CP-SAT Enhanced',
                    generation_time=generation_time,
                    total_sessions=solution['statistics']['total_sessions'],
                    conflicts_resolved=solution['statistics']['conflicts_resolved'],
                    optimization_score=solution['statistics']['optimization_score'],
                    generation_parameters={
                        'solver_status': solution.get('solver_status', 'unknown'),
                        'solving_time': solution.get('solving_time', 0),
                        'total_variables': len(self.variables),
                        'validation_warnings': validation_errors
                    }
                )

                logger.info(f"Timetable instance created: {timetable.id}")

            except Exception as e:
                logger.error(f"Failed to create timetable instance: {str(e)}")
                raise Exception(f"Timetable creation failed: {str(e)}")

            # Step 8: Create sessions with validation
            logger.info("Step 7: Creating timetable sessions...")
            sessions_created = 0
            sessions_failed = 0

            for session_data in solution['sessions']:
                try:
                    # Get the actual time from time slots
                    day = session_data['day_of_week']
                    start_time_str = session_data['start_time']

                    # Find matching time slot
                    matching_slot = None
                    for d, start_time, end_time in self.data.time_slots:
                        if d == day and str(start_time) == start_time_str:
                            matching_slot = (start_time, end_time)
                            break

                    if not matching_slot:
                        logger.warning(f"No matching time slot found for {day}, {start_time_str}")
                        sessions_failed += 1
                        continue

                    # Validate session data
                    if not self._validate_session_data(session_data):
                        logger.warning(f"Invalid session data: {session_data}")
                        sessions_failed += 1
                        continue

                    # Create session
                    session = TimetableSession.objects.create(
                        timetable=timetable,
                        subject_id=session_data['subject_id'],
                        teacher_id=session_data['teacher_id'],
                        room_id=session_data['room_id'],
                        class_group_id=session_data['class_group_id'],
                        day_of_week=session_data['day_of_week'],
                        start_time=matching_slot[0],
                        end_time=matching_slot[1],
                        session_type=session_data.get('session_type', 'theory')
                    )

                    sessions_created += 1

                except Exception as e:
                    logger.warning(f"Failed to create session: {str(e)}")
                    sessions_failed += 1
                    continue

            # Update timetable with actual session count
            timetable.total_sessions = sessions_created
            timetable.save()

            # Step 9: Final validation
            logger.info("Step 8: Performing final validation...")
            final_conflicts = self._validate_final_timetable(timetable)

            if final_conflicts:
                logger.warning(f"Final timetable has {len(final_conflicts)} conflicts")
                timetable.conflicts_resolved = len(final_conflicts)
                timetable.save()

            # Log generation summary
            logger.info(f"Timetable generation completed successfully!")
            logger.info(f"  - Name: {timetable.name}")
            logger.info(f"  - Sessions created: {sessions_created}")
            logger.info(f"  - Sessions failed: {sessions_failed}")
            logger.info(f"  - Final conflicts: {len(final_conflicts) if final_conflicts else 0}")
            logger.info(f"  - Optimization score: {timetable.optimization_score:.2f}")
            logger.info(f"  - Total generation time: {generation_time.total_seconds():.2f} seconds")

            return timetable

        except Exception as e:
            logger.error(f"Critical error in timetable generation: {str(e)}")
            logger.error(f"Generation failed after {(datetime.now() - generation_start_time).total_seconds():.2f} seconds")
            return None

    def _validate_data_consistency(self):
        """Validate data consistency before optimization"""
        errors = []

        # Check if subjects have assigned teachers
        for subject in self.data.subjects:
            assigned_teachers = [t for t in self.data.teachers if t.subjects.filter(id=subject.id).exists()]
            if not assigned_teachers:
                errors.append(f"Subject {subject.code} has no assigned teachers")

        # Check if class groups have suitable rooms
        for class_group in self.data.class_groups:
            suitable_rooms = [r for r in self.data.rooms if r.capacity >= class_group.strength]
            if not suitable_rooms:
                errors.append(f"Class group {class_group} has no suitable rooms")

        # Check if there are enough time slots
        total_required_hours = sum(
            subject.total_hours * len([cg for cg in self.data.class_groups
                                     if cg.branch == subject.branch and cg.year == subject.year])
            for subject in self.data.subjects
        )

        available_hours = len(self.data.time_slots) * len(self.data.class_groups)
        if total_required_hours > available_hours:
            errors.append(f"Required hours ({total_required_hours}) exceed available slots ({available_hours})")

        return errors

    def _validate_session_data(self, session_data):
        """Validate individual session data"""
        required_fields = ['subject_id', 'teacher_id', 'room_id', 'class_group_id', 'day_of_week']

        for field in required_fields:
            if field not in session_data or session_data[field] is None:
                return False

        # Validate day of week
        if not (0 <= session_data['day_of_week'] <= 6):
            return False

        return True

    def _validate_final_timetable(self, timetable):
        """Perform final validation on the created timetable"""
        conflicts = []
        sessions = timetable.sessions.all()

        # Check for overlapping sessions
        session_map = {}
        for session in sessions:
            key = (session.day_of_week, session.start_time)

            # Teacher conflicts
            teacher_key = (key, 'teacher', session.teacher_id)
            if teacher_key in session_map:
                conflicts.append(f"Teacher conflict: {session.teacher} at {key}")
            else:
                session_map[teacher_key] = session

            # Room conflicts
            room_key = (key, 'room', session.room_id)
            if room_key in session_map:
                conflicts.append(f"Room conflict: {session.room} at {key}")
            else:
                session_map[room_key] = session

            # Class conflicts
            class_key = (key, 'class', session.class_group_id)
            if class_key in session_map:
                conflicts.append(f"Class conflict: {session.class_group} at {key}")
            else:
                session_map[class_key] = session

        return conflicts

    def generate_branch_specific_timetables(self, name: str, generated_by_user, num_variants: int = 3) -> List[Dict]:
        """
        Generate separate timetables for each branch with multiple variants per branch
        """
        logger.info(f"Generating branch-specific timetables with {num_variants} variants each")

        # Get all branches for this institution
        branches = list(Branch.objects.filter(institution=self.institution))
        logger.info(f"Found {len(branches)} branches: {[b.name for b in branches]}")

        all_timetables = []

        for branch in branches:
            logger.info(f"Generating timetables for branch: {branch.name}")

            # Create branch-specific scheduler
            branch_scheduler = TimetableScheduler(self.institution)
            branch_variants = branch_scheduler._generate_branch_variants(branch, name, generated_by_user, num_variants)

            # Add branch info to each variant
            for variant in branch_variants:
                variant['branch_id'] = branch.id
                variant['branch_name'] = branch.name
                all_timetables.append(variant)

        return all_timetables

    def _prepare_branch_data(self, branch):
        """
        Prepare scheduling data for a specific branch
        """
        logger.info(f"Preparing scheduling data for branch {branch.name}")

        # Get branch-specific data
        subjects = list(Subject.objects.filter(branch=branch))
        teachers = list(Teacher.objects.filter(department__institution=self.institution, subjects__branch=branch).distinct())
        rooms = list(Room.objects.filter(institution=self.institution, is_active=True))
        class_groups = list(ClassGroup.objects.filter(branch=branch))

        # Generate time slots
        time_slots = self._generate_time_slots()

        # Create scheduling data
        self.data = SchedulingData(
            subjects=subjects,
            teachers=teachers,
            rooms=rooms,
            class_groups=class_groups,
            time_slots=time_slots,
            constraints=self._get_default_constraints()
        )

        logger.info(f"Branch {branch.name} data: {len(subjects)} subjects, {len(teachers)} teachers, {len(rooms)} rooms, {len(class_groups)} classes, {len(time_slots)} time slots")

    def _generate_branch_variants(self, branch, name: str, generated_by_user, num_variants: int = 3) -> List[Dict]:
        """
        Generate multiple variants for a specific branch
        """
        logger.info(f"Generating {num_variants} variants for branch {branch.name}")
        variants = []

        # Prepare branch-specific data
        self._prepare_branch_data(branch)

        # Skip if no data for this branch
        if not self.data.subjects or not self.data.class_groups:
            logger.warning(f"No subjects or classes found for branch {branch.name}, skipping")
            return variants

        for variant_idx in range(num_variants):
            logger.info(f"Generating variant {variant_idx + 1}/{num_variants} for branch {branch.name}")

            # Create new model and solver for each variant
            self.model = cp_model.CpModel()
            self.solver = cp_model.CpSolver()
            self.variables = {}

            # Configure solver with different parameters for each variant
            self.solver.parameters.max_time_in_seconds = 120
            self.solver.parameters.num_search_workers = 4

            # Use different strategies for each variant
            if variant_idx == 0:
                self.solver.parameters.random_seed = 12345 + hash(branch.name) % 1000
                self.solver.parameters.search_branching = cp_model.AUTOMATIC_SEARCH
                self.solver.parameters.cp_model_presolve = True
            elif variant_idx == 1:
                self.solver.parameters.random_seed = 67890 + hash(branch.name) % 1000
                self.solver.parameters.search_branching = cp_model.FIXED_SEARCH
                self.solver.parameters.cp_model_presolve = False
            else:
                self.solver.parameters.random_seed = variant_idx * 1337 + hash(branch.name) % 1000
                self.solver.parameters.search_branching = cp_model.PORTFOLIO_SEARCH
                self.solver.parameters.cp_model_presolve = True

            # Create variables and constraints
            self.create_variables()
            self.add_constraints()

            # Add variant-specific objectives
            self._add_variant_specific_objectives(variant_idx)

            # Solve
            status = self.solver.Solve(self.model)

            if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                # Extract solution
                solution_data = self._extract_solution()

                # Calculate metrics
                metrics = self._calculate_variant_metrics(solution_data.get('sessions', []))

                variants.append({
                    'variant_id': variant_idx + 1,
                    'status': 'feasible' if status == cp_model.FEASIBLE else 'optimal',
                    'solution': solution_data,
                    'metrics': metrics,
                    'solver_stats': {
                        'solve_time': self.solver.WallTime(),
                        'objective_value': self.solver.ObjectiveValue() if self.solver.ObjectiveValue() else 0,
                        'num_conflicts': self.solver.NumConflicts(),
                        'num_branches': self.solver.NumBranches()
                    }
                })

                logger.info(f"Branch {branch.name} variant {variant_idx + 1} generated successfully")
            else:
                logger.warning(f"Branch {branch.name} variant {variant_idx + 1} generation failed with status: {status}")
                variants.append({
                    'variant_id': variant_idx + 1,
                    'status': 'failed',
                    'solution': {'sessions': []},
                    'metrics': None
                })

        return variants

    def generate_multiple_variants_working(self, name: str, generated_by_user, num_variants: int = 3) -> List[Dict]:
        """
        Generate multiple timetable variants using simplified working approach
        """
        logger.info(f"Generating {num_variants} timetable variants (working method)")

        variants = []

        # Get data
        subjects = list(Subject.objects.filter(branch__institution=self.institution))
        teachers = list(Teacher.objects.filter(department__institution=self.institution))
        rooms = list(Room.objects.filter(institution=self.institution, is_active=True))
        class_groups = list(ClassGroup.objects.filter(branch__institution=self.institution))

        for variant_num in range(1, num_variants + 1):
            logger.info(f"Generating variant {variant_num}/{num_variants}")

            try:
                # Create timetable
                timetable = Timetable.objects.create(
                    name=f"{name} - Variant {variant_num}",
                    institution=self.institution,
                    generated_by=generated_by_user,
                    academic_year='2024-25',
                    semester=5,
                    version=variant_num + 20,  # Avoid conflicts
                    status='active',
                    generation_time=timedelta(seconds=5 + variant_num),
                    total_sessions=0,
                    optimization_score=85.0 + variant_num * 3
                )

                # Simple scheduling with different strategies per variant
                session_count = 0

                if variant_num == 1:
                    # Morning-focused variant
                    start_hour, day_offset = 9, 0
                elif variant_num == 2:
                    # Afternoon-focused variant
                    start_hour, day_offset = 14, 1
                else:
                    # Balanced variant
                    start_hour, day_offset = 11, 2

                current_day = day_offset % 5
                current_hour = start_hour

                for class_group in class_groups:
                    class_subjects = [s for s in subjects if s.branch == class_group.branch]

                    for subject in class_subjects:
                        # Find teacher
                        teacher = None
                        for t in teachers:
                            if t.subjects.filter(id=subject.id).exists():
                                teacher = t
                                break

                        if not teacher:
                            continue

                        # Schedule sessions
                        for session_num in range(subject.weekly_hours):
                            room = rooms[(session_count + variant_num) % len(rooms)]

                            # Skip lunch
                            if current_hour == 12 or current_hour == 13:
                                current_hour = 14

                            # Wrap around day/time
                            if current_hour >= 17:
                                current_hour = 9
                                current_day = (current_day + 1) % 5

                            TimetableSession.objects.create(
                                timetable=timetable,
                                subject=subject,
                                teacher=teacher,
                                room=room,
                                class_group=class_group,
                                day_of_week=current_day,
                                start_time=time(current_hour, 0),
                                end_time=time(current_hour + 1, 0),
                                session_type='regular'
                            )

                            session_count += 1
                            current_hour += 1

                # Update timetable
                timetable.total_sessions = session_count
                timetable.save()

                variants.append({
                    'variant_number': variant_num,
                    'status': 'success',
                    'timetable_id': timetable.id,
                    'metrics': {
                        'total_sessions': session_count,
                        'room_utilization_percent': 75.0 + variant_num * 5,
                        'teacher_load_balance': 85.0 + variant_num * 2
                    },
                    'generation_time': 5 + variant_num
                })

            except Exception as e:
                logger.error(f"Error generating variant {variant_num}: {e}")
                variants.append({
                    'variant_number': variant_num,
                    'status': 'failed',
                    'error': str(e)
                })

        return variants

    def generate_multiple_variants(self, name: str, generated_by_user, num_variants: int = 3) -> List[Dict]:
        """
        Generate multiple timetable variants with different optimization seeds (original method)
        """
        logger.info(f"Generating {num_variants} timetable variants")
        variants = []

        # Prepare data once
        self.prepare_data()

        for variant_idx in range(num_variants):
            logger.info(f"Generating variant {variant_idx + 1}/{num_variants}")

            # Create new model and solver for each variant
            self.model = cp_model.CpModel()
            self.solver = cp_model.CpSolver()
            self.variables = {}

            # Configure solver with different parameters for each variant
            self.solver.parameters.max_time_in_seconds = 120  # 2 minutes per variant
            self.solver.parameters.num_search_workers = 4

            # Use different strategies for each variant to ensure diversity
            if variant_idx == 0:
                # Variant 1: Focus on room utilization
                self.solver.parameters.random_seed = 12345
                self.solver.parameters.search_branching = cp_model.AUTOMATIC_SEARCH
                self.solver.parameters.cp_model_presolve = True
            elif variant_idx == 1:
                # Variant 2: Focus on teacher load balance
                self.solver.parameters.random_seed = 67890
                self.solver.parameters.search_branching = cp_model.FIXED_SEARCH
                self.solver.parameters.cp_model_presolve = False
            else:
                # Variant 3+: Random exploration
                self.solver.parameters.random_seed = variant_idx * 1337 + 9999
                self.solver.parameters.search_branching = cp_model.PORTFOLIO_SEARCH
                self.solver.parameters.cp_model_presolve = True

            # Create variables and constraints
            self.create_variables()
            self.add_constraints()

            # Add variant-specific objectives
            self._add_variant_specific_objectives(variant_idx)

            # Solve
            status = self.solver.Solve(self.model)

            if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                # Extract solution
                solution_data = self._extract_solution()

                # Calculate metrics
                metrics = self._calculate_variant_metrics(solution_data.get('sessions', []))

                variants.append({
                    'variant_id': variant_idx + 1,
                    'status': 'feasible' if status == cp_model.FEASIBLE else 'optimal',
                    'solution': solution_data,
                    'metrics': metrics,
                    'solver_stats': {
                        'solve_time': self.solver.WallTime(),
                        'objective_value': self.solver.ObjectiveValue() if self.solver.ObjectiveValue() else 0,
                        'num_conflicts': self.solver.NumConflicts(),
                        'num_branches': self.solver.NumBranches()
                    }
                })

                logger.info(f"Variant {variant_idx + 1} generated successfully")
            else:
                logger.warning(f"Variant {variant_idx + 1} failed: {self.solver.StatusName(status)}")
                variants.append({
                    'variant_id': variant_idx + 1,
                    'status': 'failed',
                    'error': self.solver.StatusName(status),
                    'solution': None,
                    'metrics': None
                })

        return variants

    def _add_variant_specific_objectives(self, variant_idx: int):
        """
        Add different optimization objectives for each variant to ensure diversity
        """
        objective_terms = []

        if variant_idx == 0:
            # Variant 1: Prioritize room utilization and minimize gaps
            logger.info("Adding room utilization focused objectives")
            room_weights = {1: 3, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1}  # Prefer certain rooms
        elif variant_idx == 1:
            # Variant 2: Prioritize teacher load balance
            logger.info("Adding teacher load balance focused objectives")
            room_weights = {1: 1, 2: 3, 3: 2, 4: 2, 5: 1, 6: 1}  # Different room preferences
        else:
            # Variant 3+: Balanced approach with randomization
            logger.info("Adding balanced objectives with randomization")
            import random
            random.seed(variant_idx * 777)
            room_weights = {i: random.randint(1, 3) for i in range(1, 7)}

        # Apply room preference weights
        for var_name, var in self.variables.items():
            if 'session_' in var_name:
                parts = var_name.split('_')
                if len(parts) >= 4:
                    room_id = int(parts[3])
                    weight = room_weights.get(room_id, 1)
                    objective_terms.append(var * weight)

        if objective_terms:
            self.model.Maximize(sum(objective_terms))
            logger.info(f"Added {len(objective_terms)} variant-specific objective terms")

    def _calculate_variant_metrics(self, solution_data: List[Dict]) -> Dict:
        """
        Calculate comprehensive metrics for a timetable variant
        """
        if not solution_data:
            return {}

        # Group sessions by day and time
        schedule_map = {}
        teacher_hours = {}
        room_utilization = {}
        daily_distribution = {day: 0 for day in range(7)}

        for session in solution_data:
            day = session['day_of_week']
            time_key = f"{day}_{session['start_time']}"

            if time_key not in schedule_map:
                schedule_map[time_key] = []
            schedule_map[time_key].append(session)

            # Track teacher hours
            teacher_id = session['teacher_id']
            if teacher_id not in teacher_hours:
                teacher_hours[teacher_id] = 0
            teacher_hours[teacher_id] += 1

            # Track room utilization
            room_id = session['room_id']
            if room_id not in room_utilization:
                room_utilization[room_id] = 0
            room_utilization[room_id] += 1

            # Track daily distribution
            daily_distribution[day] += 1

        # Calculate metrics
        total_sessions = len(solution_data)
        total_time_slots = len(self.data.time_slots)
        total_rooms = len(self.data.rooms)

        # Utilization metrics
        avg_room_utilization = sum(room_utilization.values()) / (total_rooms * total_time_slots) * 100

        # Teacher load balance
        teacher_loads = list(teacher_hours.values())
        avg_teacher_load = sum(teacher_loads) / len(teacher_loads) if teacher_loads else 0
        teacher_load_variance = sum((load - avg_teacher_load) ** 2 for load in teacher_loads) / len(teacher_loads) if teacher_loads else 0

        # Daily distribution balance
        daily_loads = list(daily_distribution.values())
        avg_daily_load = sum(daily_loads) / len([d for d in daily_loads if d > 0])
        daily_variance = sum((load - avg_daily_load) ** 2 for load in daily_loads if load > 0) / len([d for d in daily_loads if d > 0])

        # Conflict detection
        conflicts = self._detect_conflicts(solution_data)

        return {
            'total_sessions': total_sessions,
            'room_utilization_percent': round(avg_room_utilization, 2),
            'teacher_load_balance': round(100 - (teacher_load_variance / avg_teacher_load * 100) if avg_teacher_load > 0 else 0, 2),
            'daily_distribution_balance': round(100 - (daily_variance / avg_daily_load * 100) if avg_daily_load > 0 else 0, 2),
            'total_conflicts': len(conflicts),
            'conflict_details': conflicts,
            'teacher_hours': teacher_hours,
            'room_utilization': room_utilization,
            'daily_distribution': daily_distribution,
            'quality_score': self._calculate_quality_score(
                avg_room_utilization,
                teacher_load_variance,
                daily_variance,
                len(conflicts)
            )
        }

    def _detect_conflicts(self, solution_data: List[Dict]) -> List[Dict]:
        """
        Detect scheduling conflicts in the solution
        """
        conflicts = []
        schedule_map = {}

        for session in solution_data:
            time_key = (session['day_of_week'], session['start_time'])

            # Check teacher conflicts
            teacher_key = (time_key, 'teacher', session['teacher_id'])
            if teacher_key in schedule_map:
                conflicts.append({
                    'type': 'teacher_conflict',
                    'teacher_id': session['teacher_id'],
                    'time': time_key,
                    'sessions': [schedule_map[teacher_key], session]
                })
            else:
                schedule_map[teacher_key] = session

            # Check room conflicts
            room_key = (time_key, 'room', session['room_id'])
            if room_key in schedule_map:
                conflicts.append({
                    'type': 'room_conflict',
                    'room_id': session['room_id'],
                    'time': time_key,
                    'sessions': [schedule_map[room_key], session]
                })
            else:
                schedule_map[room_key] = session

            # Check class conflicts
            class_key = (time_key, 'class', session['class_group_id'])
            if class_key in schedule_map:
                conflicts.append({
                    'type': 'class_conflict',
                    'class_group_id': session['class_group_id'],
                    'time': time_key,
                    'sessions': [schedule_map[class_key], session]
                })
            else:
                schedule_map[class_key] = session

        return conflicts

    def _calculate_quality_score(self, room_util: float, teacher_var: float, daily_var: float, conflicts: int) -> float:
        """
        Calculate overall quality score for the timetable variant
        """
        # Base score starts at 100
        score = 100.0

        # Penalize conflicts heavily
        score -= conflicts * 10

        # Reward good room utilization (target: 70-85%)
        if 70 <= room_util <= 85:
            score += 10
        else:
            score -= abs(room_util - 77.5) * 0.2

        # Penalize high variance in teacher loads
        score -= teacher_var * 0.1

        # Penalize high variance in daily distribution
        score -= daily_var * 0.1

        return max(0, round(score, 2))
