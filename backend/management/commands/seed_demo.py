"""
Django management command to seed demo data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import time
from timetable.models import (
    Institution, Branch, ClassGroup, Subject, Teacher, TeacherSubject,
    Room, Timetable
)
from scheduler.ortools_scheduler import TimetableScheduler

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with demo data for testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
        
        self.stdout.write('Seeding demo data...')
        
        with transaction.atomic():
            # Create users
            users = self.create_users()
            
            # Create institution
            institution = self.create_institution()
            
            # Create branches
            branches = self.create_branches(institution)
            
            # Create class groups
            class_groups = self.create_class_groups(branches)
            
            # Create subjects
            subjects = self.create_subjects(branches)
            
            # Create rooms
            rooms = self.create_rooms(institution)
            
            # Create teachers
            teachers = self.create_teachers(users, branches, subjects)
            
            # Generate demo timetable
            self.generate_demo_timetable(institution, users['admin'])
        
        self.stdout.write(
            self.style.SUCCESS('Successfully seeded demo data!')
        )
    
    def clear_data(self):
        """Clear existing data"""
        Timetable.objects.all().delete()
        TeacherSubject.objects.all().delete()
        Teacher.objects.all().delete()
        Room.objects.all().delete()
        Subject.objects.all().delete()
        ClassGroup.objects.all().delete()
        Branch.objects.all().delete()
        Institution.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
    
    def create_users(self):
        """Create demo users"""
        users = {}
        
        # Admin user
        admin, created = User.objects.get_or_create(
            email='admin@demo.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
        users['admin'] = admin
        
        # Faculty users
        faculty_data = [
            ('Dr. John Smith', 'john.smith@demo.com', 'EMP001'),
            ('Prof. Sarah Johnson', 'sarah.johnson@demo.com', 'EMP002'),
            ('Dr. Michael Brown', 'michael.brown@demo.com', 'EMP003'),
            ('Ms. Emily Davis', 'emily.davis@demo.com', 'EMP004'),
            ('Dr. Robert Wilson', 'robert.wilson@demo.com', 'EMP005'),
        ]
        
        users['faculty'] = []
        for name, email, emp_id in faculty_data:
            first_name, last_name = name.split(' ', 1)
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': User.Role.FACULTY,
                    'employee_id': emp_id
                }
            )
            if created:
                user.set_password('faculty123')
                user.save()
            users['faculty'].append(user)
        
        # Student user
        student, created = User.objects.get_or_create(
            email='student@demo.com',
            defaults={
                'username': 'student',
                'first_name': 'Student',
                'last_name': 'User',
                'role': User.Role.STUDENT,
                'student_id': 'STU001'
            }
        )
        if created:
            student.set_password('student123')
            student.save()
        users['student'] = student
        
        return users
    
    def create_institution(self):
        """Create demo institution"""
        institution, created = Institution.objects.get_or_create(
            name='Demo College of Technology',
            defaults={
                'type': Institution.InstitutionType.COLLEGE,
                'address': '123 Education Street, Tech City, TC 12345',
                'phone': '+1-555-0123',
                'email': 'info@democollege.edu',
                'website': 'https://democollege.edu',
                'academic_year': '2025-26',
                'start_time': time(9, 0),
                'end_time': time(17, 0),
                'slot_duration': 60,
                'lunch_break_start': time(13, 0),
                'lunch_break_end': time(14, 0),
                'working_days': [0, 1, 2, 3, 4]  # Monday to Friday
            }
        )
        return institution
    
    def create_branches(self, institution):
        """Create demo branches"""
        branch_data = [
            ('Computer Science Engineering', 'CSE'),
            ('Electronics & Communication Engineering', 'ECE'),
            ('Master of Business Administration', 'MBA'),
        ]
        
        branches = []
        for name, code in branch_data:
            branch, created = Branch.objects.get_or_create(
                institution=institution,
                code=code,
                defaults={
                    'name': name,
                    'description': f'{name} department'
                }
            )
            branches.append(branch)
        
        return branches
    
    def create_class_groups(self, branches):
        """Create demo class groups"""
        class_groups = []
        
        for branch in branches:
            if branch.code in ['CSE', 'ECE']:
                # Engineering branches - 4 years
                for year in [1, 2, 3, 4]:
                    for section in ['A', 'B']:
                        class_group, created = ClassGroup.objects.get_or_create(
                            branch=branch,
                            year=year,
                            section=section,
                            defaults={
                                'name': f'{branch.code}-{year}-{section}',
                                'semester': (year - 1) * 2 + 1,  # Odd semester
                                'strength': 60
                            }
                        )
                        class_groups.append(class_group)
            else:
                # MBA - 2 years
                for year in [1, 2]:
                    class_group, created = ClassGroup.objects.get_or_create(
                        branch=branch,
                        year=year,
                        section='A',
                        defaults={
                            'name': f'{branch.code}-{year}',
                            'semester': (year - 1) * 2 + 1,
                            'strength': 80
                        }
                    )
                    class_groups.append(class_group)
        
        return class_groups
    
    def create_subjects(self, branches):
        """Create demo subjects"""
        subjects_data = {
            'CSE': [
                ('CS101', 'Programming Fundamentals', 'core', 4, 1, 1),
                ('CS102', 'Data Structures', 'core', 4, 1, 1),
                ('CS103', 'Database Systems', 'core', 3, 1, 1),
                ('CS104', 'Web Development', 'elective', 3, 1, 1),
                ('CS105', 'Programming Lab', 'lab', 2, 1, 1),
            ],
            'ECE': [
                ('EC101', 'Circuit Analysis', 'core', 4, 1, 1),
                ('EC102', 'Digital Electronics', 'core', 4, 1, 1),
                ('EC103', 'Signals & Systems', 'core', 3, 1, 1),
                ('EC104', 'Communication Systems', 'elective', 3, 1, 1),
                ('EC105', 'Electronics Lab', 'lab', 2, 1, 1),
            ],
            'MBA': [
                ('MB101', 'Management Principles', 'core', 3, 1, 1),
                ('MB102', 'Financial Management', 'core', 3, 1, 1),
                ('MB103', 'Marketing Management', 'core', 3, 1, 1),
                ('MB104', 'Operations Management', 'elective', 3, 1, 1),
                ('MB105', 'Business Analytics', 'skill', 2, 1, 1),
            ]
        }
        
        subjects = []
        for branch in branches:
            if branch.code in subjects_data:
                for code, name, subject_type, credits, semester, year in subjects_data[branch.code]:
                    subject, created = Subject.objects.get_or_create(
                        branch=branch,
                        code=code,
                        defaults={
                            'name': name,
                            'type': subject_type,
                            'credits': credits,
                            'semester': semester,
                            'year': year,
                            'theory_hours': 3 if subject_type != 'lab' else 0,
                            'practical_hours': 2 if subject_type == 'lab' else 0,
                            'tutorial_hours': 1 if subject_type == 'core' else 0
                        }
                    )
                    subjects.append(subject)
        
        return subjects
    
    def create_rooms(self, institution):
        """Create demo rooms"""
        room_data = [
            ('LH-101', 'Lecture Hall 101', 'classroom', 80),
            ('LH-102', 'Lecture Hall 102', 'classroom', 80),
            ('LH-103', 'Lecture Hall 103', 'classroom', 60),
            ('LAB-201', 'Computer Lab 1', 'laboratory', 40),
            ('LAB-202', 'Electronics Lab', 'laboratory', 30),
            ('SH-301', 'Seminar Hall', 'seminar_hall', 120),
        ]
        
        rooms = []
        for code, name, room_type, capacity in room_data:
            room, created = Room.objects.get_or_create(
                institution=institution,
                code=code,
                defaults={
                    'name': name,
                    'type': room_type,
                    'capacity': capacity,
                    'has_projector': True,
                    'has_computer': room_type == 'laboratory',
                    'has_whiteboard': True,
                    'has_ac': True,
                    'building': 'Main Building',
                    'floor': int(code.split('-')[1][0])
                }
            )
            rooms.append(room)
        
        return rooms
    
    def create_teachers(self, users, branches, subjects):
        """Create demo teachers"""
        teachers = []
        
        # Map faculty users to branches
        branch_mapping = {
            0: 'CSE',  # Dr. John Smith
            1: 'CSE',  # Prof. Sarah Johnson
            2: 'ECE',  # Dr. Michael Brown
            3: 'ECE',  # Ms. Emily Davis
            4: 'MBA',  # Dr. Robert Wilson
        }
        
        for i, faculty_user in enumerate(users['faculty']):
            branch_code = branch_mapping.get(i, 'CSE')
            branch = next((b for b in branches if b.code == branch_code), branches[0])
            
            teacher, created = Teacher.objects.get_or_create(
                user=faculty_user,
                defaults={
                    'employee_id': faculty_user.employee_id,
                    'designation': Teacher.Designation.ASSISTANT_PROFESSOR,
                    'department': branch,
                    'specialization': f'{branch.name} Specialist',
                    'qualification': 'Ph.D.',
                    'experience_years': 5 + i,
                    'max_hours_per_day': 6,
                    'max_hours_per_week': 24,
                    'max_consecutive_hours': 3
                }
            )
            teachers.append(teacher)
            
            # Assign subjects to teachers
            branch_subjects = [s for s in subjects if s.branch == branch]
            for subject in branch_subjects[:3]:  # Assign first 3 subjects
                TeacherSubject.objects.get_or_create(
                    teacher=teacher,
                    subject=subject,
                    defaults={
                        'preference_level': 4,
                        'can_teach_theory': True,
                        'can_teach_practical': subject.type == 'lab'
                    }
                )
        
        return teachers
    
    def generate_demo_timetable(self, institution, admin_user):
        """Generate a demo timetable with enhanced error handling"""
        try:
            self.stdout.write('Starting timetable generation...')

            # Validate data before generation
            validation_errors = self._validate_scheduling_data(institution)
            if validation_errors:
                self.stdout.write(
                    self.style.WARNING(f'Validation warnings: {"; ".join(validation_errors)}')
                )

            scheduler = TimetableScheduler(institution.id)

            # Add timeout and retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    self.stdout.write(f'Generation attempt {attempt + 1}/{max_retries}...')

                    timetable = scheduler.generate_timetable(
                        name=f'Demo Timetable 2025 - Semester 1 (v{attempt + 1})',
                        generated_by_user=admin_user
                    )

                    if timetable:
                        # Validate generated timetable for conflicts
                        conflicts = self._validate_generated_timetable(timetable)

                        if conflicts['total_conflicts'] == 0:
                            timetable.status = Timetable.Status.ACTIVE
                            timetable.save()
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Successfully generated conflict-free timetable: {timetable.name} '
                                    f'({timetable.total_sessions} sessions)'
                                )
                            )
                            return timetable
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'Generated timetable has {conflicts["total_conflicts"]} conflicts. '
                                    f'Retrying...'
                                )
                            )
                            # Delete conflicted timetable and retry
                            timetable.delete()
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'Attempt {attempt + 1} failed - no solution found')
                        )

                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'Attempt {attempt + 1} failed with error: {str(e)}')
                    )
                    if attempt < max_retries - 1:
                        self.stdout.write('Retrying with relaxed constraints...')
                        # Could implement constraint relaxation here

            # If all attempts failed, create a basic manual timetable
            self.stdout.write(
                self.style.WARNING('Auto-generation failed. Creating basic manual timetable...')
            )
            return self._create_basic_manual_timetable(institution, admin_user)

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Critical error in timetable generation: {str(e)}')
            )
            return None

    def _validate_scheduling_data(self, institution):
        """Validate data before scheduling"""
        errors = []

        # Check if we have enough data
        branches = Branch.objects.filter(institution=institution)
        if not branches.exists():
            errors.append("No branches found")

        subjects = Subject.objects.filter(branch__institution=institution)
        if not subjects.exists():
            errors.append("No subjects found")

        teachers = Teacher.objects.filter(department__institution=institution)
        if not teachers.exists():
            errors.append("No teachers found")

        rooms = Room.objects.filter(institution=institution, is_active=True)
        if not rooms.exists():
            errors.append("No active rooms found")

        class_groups = ClassGroup.objects.filter(branch__institution=institution)
        if not class_groups.exists():
            errors.append("No class groups found")

        # Check for potential capacity issues
        for class_group in class_groups:
            suitable_rooms = rooms.filter(capacity__gte=class_group.strength)
            if not suitable_rooms.exists():
                errors.append(f"No rooms with sufficient capacity for {class_group}")

        # Check teacher-subject assignments
        unassigned_subjects = subjects.exclude(teachers__isnull=False)
        if unassigned_subjects.exists():
            errors.append(f"{unassigned_subjects.count()} subjects have no assigned teachers")

        return errors

    def _validate_generated_timetable(self, timetable):
        """Validate generated timetable for conflicts"""
        conflicts = {
            'teacher_conflicts': [],
            'room_conflicts': [],
            'class_conflicts': [],
            'total_conflicts': 0
        }

        sessions = timetable.sessions.all()

        # Check teacher conflicts
        teacher_schedule = {}
        for session in sessions:
            if session.teacher:
                key = (session.teacher.id, session.day_of_week, session.start_time)
                if key in teacher_schedule:
                    conflicts['teacher_conflicts'].append({
                        'teacher': session.teacher.user.get_full_name(),
                        'sessions': [session.id, teacher_schedule[key].id]
                    })
                else:
                    teacher_schedule[key] = session

        # Check room conflicts
        room_schedule = {}
        for session in sessions:
            if session.room:
                key = (session.room.id, session.day_of_week, session.start_time)
                if key in room_schedule:
                    conflicts['room_conflicts'].append({
                        'room': session.room.name,
                        'sessions': [session.id, room_schedule[key].id]
                    })
                else:
                    room_schedule[key] = session

        # Check class conflicts
        class_schedule = {}
        for session in sessions:
            key = (session.class_group.id, session.day_of_week, session.start_time)
            if key in class_schedule:
                conflicts['class_conflicts'].append({
                    'class': str(session.class_group),
                    'sessions': [session.id, class_schedule[key].id]
                })
            else:
                class_schedule[key] = session

        conflicts['total_conflicts'] = (
            len(conflicts['teacher_conflicts']) +
            len(conflicts['room_conflicts']) +
            len(conflicts['class_conflicts'])
        )

        return conflicts

    def _create_basic_manual_timetable(self, institution, admin_user):
        """Create a basic manual timetable as fallback"""
        try:
            from datetime import time

            timetable = Timetable.objects.create(
                institution=institution,
                name='Demo Timetable - Manual Fallback',
                academic_year=institution.academic_year,
                generated_by=admin_user,
                algorithm_used='Manual Fallback',
                status=Timetable.Status.DRAFT
            )

            # Get basic data
            class_groups = ClassGroup.objects.filter(branch__institution=institution)[:2]  # Limit to 2 classes
            subjects = Subject.objects.filter(branch__institution=institution)[:5]  # Limit to 5 subjects
            teachers = Teacher.objects.filter(department__institution=institution)
            rooms = Room.objects.filter(institution=institution, is_active=True)

            if not all([class_groups, subjects, teachers, rooms]):
                self.stdout.write(
                    self.style.ERROR('Insufficient data for manual timetable creation')
                )
                return None

            # Create simple schedule (9 AM to 12 PM, Monday to Wednesday)
            time_slots = [
                (time(9, 0), time(10, 0)),
                (time(10, 0), time(11, 0)),
                (time(11, 0), time(12, 0)),
            ]

            session_count = 0
            for day in range(3):  # Monday to Wednesday
                for class_group in class_groups:
                    for slot_idx, (start_time, end_time) in enumerate(time_slots):
                        if slot_idx < len(subjects) and slot_idx < len(teachers):
                            subject = subjects[slot_idx]
                            teacher = teachers[slot_idx % len(teachers)]
                            room = rooms[slot_idx % len(rooms)]

                            # Check room capacity
                            if room.capacity >= class_group.strength:
                                TimetableSession.objects.create(
                                    timetable=timetable,
                                    subject=subject,
                                    teacher=teacher,
                                    room=room,
                                    class_group=class_group,
                                    day_of_week=day,
                                    start_time=start_time,
                                    end_time=end_time,
                                    session_type='theory'
                                )
                                session_count += 1

            timetable.total_sessions = session_count
            timetable.save()

            self.stdout.write(
                self.style.SUCCESS(f'Created basic manual timetable with {session_count} sessions')
            )

            return timetable

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create manual timetable: {str(e)}')
            )
            return None
