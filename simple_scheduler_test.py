#!/usr/bin/env python3
"""
Simple scheduler test to verify basic functionality
"""

import os
import sys
import django

# Change to backend directory
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)

# Add the backend directory to the path
sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from timetable.models import Institution, Branch, Subject, Teacher, Room, ClassGroup, TeacherSubject, Timetable, TimetableSession
from ortools.sat.python import cp_model
from datetime import datetime, time, timedelta

User = get_user_model()

def simple_scheduler_test():
    print("🧪 Simple Scheduler Test")
    
    institution = Institution.objects.first()
    print(f"Institution: {institution.name}")
    
    # Get one class and its subjects
    cse_class = ClassGroup.objects.get(name='CSE-3A')
    cse_subjects = Subject.objects.filter(branch=cse_class.branch)
    
    print(f"Class: {cse_class.name}")
    print(f"Subjects: {[s.name for s in cse_subjects]}")
    
    # Get teachers for these subjects
    teachers = []
    for subject in cse_subjects:
        teacher_assignments = TeacherSubject.objects.filter(subject=subject)
        for ta in teacher_assignments:
            if ta.teacher not in teachers:
                teachers.append(ta.teacher)
    
    print(f"Teachers: {[t.user.get_full_name() for t in teachers]}")
    
    # Get rooms
    rooms = list(Room.objects.filter(institution=institution, is_active=True))
    print(f"Rooms: {[r.name for r in rooms]}")
    
    # Generate time slots (simplified)
    time_slots = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    start_hour = 8
    end_hour = 17
    
    for day_idx, day in enumerate(days):
        for hour in range(start_hour, end_hour):
            if hour == 12 or hour == 13:  # Skip lunch
                continue
            time_slots.append((day_idx, hour, f"{day}-{hour:02d}:00"))
    
    print(f"Time slots: {len(time_slots)}")
    
    # Create CP model
    model = cp_model.CpModel()
    
    # Variables: session[subject][teacher][room][class][day][hour]
    variables = {}
    
    for subject in cse_subjects:
        # Find teacher for this subject
        teacher_assignment = TeacherSubject.objects.filter(subject=subject).first()
        if not teacher_assignment:
            print(f"⚠️ No teacher for {subject.name}")
            continue
            
        teacher = teacher_assignment.teacher
        
        for room in rooms:
            for day_idx, hour, slot_name in time_slots:
                var_name = f"s_{subject.id}_t_{teacher.id}_r_{room.id}_c_{cse_class.id}_d_{day_idx}_h_{hour}"
                variables[var_name] = model.NewBoolVar(var_name)
    
    print(f"Variables created: {len(variables)}")
    
    # Constraint 1: Each subject gets exactly its required weekly hours
    for subject in cse_subjects:
        teacher_assignment = TeacherSubject.objects.filter(subject=subject).first()
        if not teacher_assignment:
            continue
            
        teacher = teacher_assignment.teacher
        
        subject_vars = []
        for room in rooms:
            for day_idx, hour, slot_name in time_slots:
                var_name = f"s_{subject.id}_t_{teacher.id}_r_{room.id}_c_{cse_class.id}_d_{day_idx}_h_{hour}"
                if var_name in variables:
                    subject_vars.append(variables[var_name])
        
        if subject_vars:
            model.Add(sum(subject_vars) == subject.weekly_hours)
            print(f"Added constraint: {subject.name} = {subject.weekly_hours} hours")
    
    # Constraint 2: No teacher conflicts
    for teacher in teachers:
        for day_idx, hour, slot_name in time_slots:
            teacher_vars_at_slot = []
            for subject in cse_subjects:
                teacher_assignment = TeacherSubject.objects.filter(subject=subject, teacher=teacher).first()
                if teacher_assignment:
                    for room in rooms:
                        var_name = f"s_{subject.id}_t_{teacher.id}_r_{room.id}_c_{cse_class.id}_d_{day_idx}_h_{hour}"
                        if var_name in variables:
                            teacher_vars_at_slot.append(variables[var_name])
            
            if teacher_vars_at_slot:
                model.Add(sum(teacher_vars_at_slot) <= 1)
    
    print("Added teacher conflict constraints")
    
    # Constraint 3: No room conflicts
    for room in rooms:
        for day_idx, hour, slot_name in time_slots:
            room_vars_at_slot = []
            for subject in cse_subjects:
                teacher_assignment = TeacherSubject.objects.filter(subject=subject).first()
                if teacher_assignment:
                    teacher = teacher_assignment.teacher
                    var_name = f"s_{subject.id}_t_{teacher.id}_r_{room.id}_c_{cse_class.id}_d_{day_idx}_h_{hour}"
                    if var_name in variables:
                        room_vars_at_slot.append(variables[var_name])
            
            if room_vars_at_slot:
                model.Add(sum(room_vars_at_slot) <= 1)
    
    print("Added room conflict constraints")
    
    # Constraint 4: Class can have at most one session per time slot
    for day_idx, hour, slot_name in time_slots:
        class_vars_at_slot = []
        for subject in cse_subjects:
            teacher_assignment = TeacherSubject.objects.filter(subject=subject).first()
            if teacher_assignment:
                teacher = teacher_assignment.teacher
                for room in rooms:
                    var_name = f"s_{subject.id}_t_{teacher.id}_r_{room.id}_c_{cse_class.id}_d_{day_idx}_h_{hour}"
                    if var_name in variables:
                        class_vars_at_slot.append(variables[var_name])
        
        if class_vars_at_slot:
            model.Add(sum(class_vars_at_slot) <= 1)
    
    print("Added class conflict constraints")
    
    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    
    print("Solving...")
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL:
        print("✅ OPTIMAL solution found!")
        return True
    elif status == cp_model.FEASIBLE:
        print("✅ FEASIBLE solution found!")
        return True
    elif status == cp_model.INFEASIBLE:
        print("❌ INFEASIBLE - no solution exists")
        return False
    else:
        print(f"❌ Solver status: {status}")
        return False

if __name__ == "__main__":
    success = simple_scheduler_test()
    if success:
        print("🎯 Simple scheduler test PASSED!")
    else:
        print("💥 Simple scheduler test FAILED!")
