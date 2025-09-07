"""
Django management command to create comprehensive demo data for testing
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from datetime import datetime, time, timedelta
import random

from users.models import User
from timetable.models import (
    Institution, Branch, Subject, Teacher, Room, ClassGroup,
    Timetable, TimetableSession, TimetableConstraint
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Create comprehensive demo data for testing the timetable system'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating demo data',
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
        
        self.stdout.write('Creating demo data...')
        
        try:
            with transaction.atomic():
                # Create users
                admin_user = self.create_admin_user()
                faculty_users = self.create_faculty_users()
                student_users = self.create_student_users()
                
                # Create institution
                institution = self.create_institution()
                
                # Create branches
                branches = self.create_branches(institution)
                
                # Create subjects
                subjects = self.create_subjects(branches)
                
                # Create rooms
                rooms = self.create_rooms(institution)
                
                # Create teachers
                teachers = self.create_teachers(institution, faculty_users, subjects, branches)
                
                # Create class groups
                class_groups = self.create_class_groups(branches)
                
                # Create timetable
                timetable = self.create_timetable(institution)
                
                # Create timetable sessions
                sessions = self.create_timetable_sessions(
                    timetable, subjects, teachers, rooms, class_groups
                )
                
                # Create constraints
                constraints = self.create_constraints(institution)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created demo data!\n'
                        f'- Institution: {institution.name}\n'
                        f'- Branches: {len(branches)}\n'
                        f'- Subjects: {len(subjects)}\n'
                        f'- Teachers: {len(teachers)}\n'
                        f'- Rooms: {len(rooms)}\n'
                        f'- Class Groups: {len(class_groups)}\n'
                        f'- Timetable Sessions: {len(sessions)}\n'
                        f'- Constraints: {len(constraints)}\n'
                        f'\nLogin credentials:\n'
                        f'Admin: admin / Admin@1234\n'
                        f'Faculty: faculty1 / Faculty@123 (and faculty2, faculty3)\n'
                        f'Student: student1 / Student@123 (and student2, student3)\n'
                        f'\nAccess the application at:\n'
                        f'- Frontend: http://localhost:3000\n'
                        f'- Backend API: http://localhost:8000\n'
                        f'- Django Admin: http://localhost:8000/admin\n'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create demo data: {e}')
            )
            raise
    
    def clear_data(self):
        """Clear existing data"""
        TimetableSession.objects.all().delete()
        Timetable.objects.all().delete()
        TimetableConstraint.objects.all().delete()
        ClassGroup.objects.all().delete()
        Teacher.objects.all().delete()
        Room.objects.all().delete()
        Subject.objects.all().delete()
        Branch.objects.all().delete()
        Institution.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
    
    def create_admin_user(self):
        """Create admin user"""
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@demo.local',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'role': 'admin'
            }
        )
        if created:
            admin.set_password('Admin@1234')
            admin.save()
        return admin
    
    def create_faculty_users(self):
        """Create faculty users"""
        faculty_users = []
        faculty_data = [
            ('faculty1', 'Dr. John', 'Smith', 'john.smith@demo.local'),
            ('faculty2', 'Prof. Sarah', 'Johnson', 'sarah.johnson@demo.local'),
            ('faculty3', 'Dr. Michael', 'Brown', 'michael.brown@demo.local'),
        ]
        
        for username, first_name, last_name, email in faculty_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'faculty'
                }
            )
            if created:
                user.set_password('Faculty@123')
                user.save()
            faculty_users.append(user)
        
        return faculty_users
    
    def create_student_users(self):
        """Create student users"""
        student_users = []
        student_data = [
            ('student1', 'Alice', 'Wilson', 'alice.wilson@demo.local'),
            ('student2', 'Bob', 'Davis', 'bob.davis@demo.local'),
            ('student3', 'Carol', 'Miller', 'carol.miller@demo.local'),
        ]
        
        for username, first_name, last_name, email in student_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'student'
                }
            )
            if created:
                user.set_password('Student@123')
                user.save()
            student_users.append(user)
        
        return student_users
    
    def create_institution(self):
        """Create demo institution"""
        institution, created = Institution.objects.get_or_create(
            name='Demo Technical University',
            defaults={
                'type': Institution.InstitutionType.UNIVERSITY,
                'address': '123 Education Street, Tech City, TC 12345',
                'phone': '+1-555-0123',
                'email': 'info@dtu.edu',
                'website': 'https://dtu.edu',
                'academic_year': '2024-25',
                'working_days': [0, 1, 2, 3, 4, 5]  # Monday to Saturday
            }
        )
        return institution
    
    def create_branches(self, institution):
        """Create demo branches"""
        branches_data = [
            ('Computer Science & Engineering', 'CSE', 'Computer Science and Engineering Department'),
            ('Electronics & Communication', 'ECE', 'Electronics and Communication Engineering'),
            ('Mechanical Engineering', 'ME', 'Mechanical Engineering Department'),
        ]
        
        branches = []
        for name, code, description in branches_data:
            branch, created = Branch.objects.get_or_create(
                institution=institution,
                code=code,
                defaults={
                    'name': name,
                    'description': description
                }
            )
            branches.append(branch)
        
        return branches
    
    def create_subjects(self, branches):
        """Create demo subjects"""
        subjects_data = [
            # CSE Subjects
            ('CS101', 'Programming Fundamentals', 'core', 4, 1, 1, 3, 2),
            ('CS102', 'Data Structures', 'core', 4, 1, 2, 3, 2),
            ('CS201', 'Database Systems', 'core', 3, 2, 3, 2, 2),
            ('CS202', 'Computer Networks', 'core', 3, 2, 4, 2, 2),
            ('CS301', 'Machine Learning', 'elective', 3, 3, 5, 2, 2),
            ('CS302', 'Web Development', 'elective', 3, 3, 6, 2, 2),
            
            # ECE Subjects
            ('EC101', 'Circuit Analysis', 'core', 4, 1, 1, 3, 2),
            ('EC102', 'Digital Electronics', 'core', 4, 1, 2, 3, 2),
            ('EC201', 'Signal Processing', 'core', 3, 2, 3, 2, 2),
            
            # ME Subjects
            ('ME101', 'Engineering Mechanics', 'core', 4, 1, 1, 3, 2),
            ('ME102', 'Thermodynamics', 'core', 4, 1, 2, 3, 2),
        ]
        
        subjects = []
        cse_branch = branches[0]  # CSE
        ece_branch = branches[1]  # ECE
        me_branch = branches[2]   # ME
        
        for code, name, subject_type, credits, year, semester, theory_hours, practical_hours in subjects_data:
            if code.startswith('CS'):
                branch = cse_branch
            elif code.startswith('EC'):
                branch = ece_branch
            else:
                branch = me_branch
            
            subject, created = Subject.objects.get_or_create(
                branch=branch,
                code=code,
                defaults={
                    'name': name,
                    'type': subject_type,
                    'credits': credits,
                    'year': year,
                    'semester': semester,
                    'theory_hours': theory_hours,
                    'practical_hours': practical_hours
                }
            )
            subjects.append(subject)
        
        return subjects
    
    def create_rooms(self, institution):
        """Create demo rooms"""
        rooms_data = [
            ('Room 101', 'R101', 'classroom', 60, 'Main Building', 1),
            ('Room 102', 'R102', 'classroom', 60, 'Main Building', 1),
            ('Lab 201', 'L201', 'laboratory', 30, 'Lab Building', 2),
            ('Lab 202', 'L202', 'laboratory', 30, 'Lab Building', 2),
            ('Seminar Hall', 'SH01', 'seminar_hall', 100, 'Main Building', 1),
            ('Auditorium', 'AUD1', 'auditorium', 300, 'Main Building', 0),
        ]
        
        rooms = []
        for name, code, room_type, capacity, building, floor in rooms_data:
            room, created = Room.objects.get_or_create(
                institution=institution,
                code=code,
                defaults={
                    'name': name,
                    'type': room_type,
                    'capacity': capacity,
                    'building': building,
                    'floor': floor
                }
            )
            rooms.append(room)
        
        return rooms
    
    def create_teachers(self, institution, faculty_users, subjects, branches):
        """Create demo teachers"""
        teachers = []
        
        teacher_data = [
            (faculty_users[0], 'EMP001', 'professor', 'Computer Networks, Database Systems'),
            (faculty_users[1], 'EMP002', 'associate_professor', 'Machine Learning, Data Science'),
            (faculty_users[2], 'EMP003', 'assistant_professor', 'Programming, Web Development'),
        ]
        
        for user, employee_id, designation, specialization in teacher_data:
            teacher, created = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    'department': branches[0],  # Assign to CSE department
                    'employee_id': employee_id,
                    'designation': designation,
                    'specialization': specialization,
                    'max_hours_per_week': 20
                }
            )
            
            # Assign subjects to teachers
            if created:
                # Assign 2-3 subjects per teacher
                assigned_subjects = random.sample(subjects[:6], 2)  # CSE subjects
                teacher.subjects.set(assigned_subjects)
            
            teachers.append(teacher)
        
        return teachers
    
    def create_class_groups(self, branches):
        """Create demo class groups"""
        class_groups = []
        
        for branch in branches:
            for year in [1, 2, 3]:
                for section in ['A', 'B']:
                    name = f"{branch.code}-{year}{section}"
                    semester = (year - 1) * 2 + 1  # Odd semester
                    
                    class_group, created = ClassGroup.objects.get_or_create(
                        branch=branch,
                        name=name,
                        defaults={
                            'year': year,
                            'section': section,
                            'semester': semester,
                            'strength': random.randint(45, 60)
                        }
                    )
                    class_groups.append(class_group)
        
        return class_groups
    
    def create_timetable(self, institution):
        """Create demo timetable"""
        # Get the admin user for generated_by field
        admin_user = User.objects.filter(is_superuser=True).first()

        timetable, created = Timetable.objects.get_or_create(
            institution=institution,
            name='Demo Timetable - Fall 2024',
            academic_year='2024-25',
            semester=1,
            defaults={
                'generated_by': admin_user,
                'status': Timetable.Status.ACTIVE,
                'version': 1
            }
        )
        return timetable
    
    def create_timetable_sessions(self, timetable, subjects, teachers, rooms, class_groups):
        """Create demo timetable sessions"""
        sessions = []
        
        # Time slots
        time_slots = [
            (time(9, 0), time(10, 0)),
            (time(10, 0), time(11, 0)),
            (time(11, 30), time(12, 30)),
            (time(12, 30), time(13, 30)),
            (time(14, 30), time(15, 30)),
            (time(15, 30), time(16, 30)),
        ]
        
        # Days (Monday=1, Friday=5)
        days = [1, 2, 3, 4, 5]
        
        # Create sessions for first few class groups
        for class_group in class_groups[:6]:  # Limit to 6 class groups
            for day in days:
                # 3-4 sessions per day per class
                daily_sessions = random.randint(3, 4)
                used_slots = []
                
                for _ in range(daily_sessions):
                    # Pick a random time slot that hasn't been used
                    available_slots = [i for i in range(len(time_slots)) if i not in used_slots]
                    if not available_slots:
                        break
                    
                    slot_index = random.choice(available_slots)
                    used_slots.append(slot_index)
                    start_time, end_time = time_slots[slot_index]
                    
                    # Pick random subject, teacher, and room
                    subject = random.choice(subjects[:6])  # CSE subjects
                    teacher = random.choice(teachers)
                    room = random.choice(rooms[:4])  # Classrooms and labs
                    
                    session_type = random.choice(['lecture', 'tutorial', 'practical'])
                    
                    session, created = TimetableSession.objects.get_or_create(
                        timetable=timetable,
                        subject=subject,
                        teacher=teacher,
                        room=room,
                        class_group=class_group,
                        day_of_week=day,
                        start_time=start_time,
                        end_time=end_time,
                        defaults={
                            'session_type': session_type
                        }
                    )
                    
                    if created:
                        sessions.append(session)
        
        return sessions
    
    def create_constraints(self, institution):
        """Create demo constraints"""
        constraints = []
        
        constraint_data = [
            ('max_hours_per_day', 'Maximum 6 hours per day per teacher', {'max_hours': 6}),
            ('lunch_break', 'Lunch break from 1:30 PM to 2:30 PM', {'start_time': '13:30', 'end_time': '14:30'}),
            ('no_back_to_back_labs', 'No back-to-back lab sessions', {}),
        ]
        
        for constraint_type, description, parameters in constraint_data:
            constraint, created = TimetableConstraint.objects.get_or_create(
                institution=institution,
                type=constraint_type,
                defaults={
                    'name': description,
                    'parameters': parameters,
                    'is_active': True,
                    'priority': 5
                }
            )
            constraints.append(constraint)
        
        return constraints
