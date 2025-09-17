from django.core.management.base import BaseCommand
from timetable.models import Institution, Branch, Subject, Teacher, Room, ClassGroup, Timetable
from users.models import User


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create Institution
        institution, created = Institution.objects.get_or_create(
            name='Bharatiya Shiksha Sansthan',
            defaults={
                'type': 'college',
                'address': 'New Delhi, India',
                'phone': '+91-11-12345678',
                'email': 'info@bharatiyashiksha.edu.in',
                'academic_year': '2024-25',
                'start_time': '09:00:00',
                'end_time': '16:00:00',
                'slot_duration': 60,
                'lunch_break_start': '13:00:00',
                'lunch_break_end': '14:00:00',
            }
        )
        if created:
            self.stdout.write(f'Created institution: {institution.name}')
        
        # Create Branches
        branches_data = [
            {'name': 'Computer Science', 'code': 'CS'},
            {'name': 'Mathematics', 'code': 'MATH'},
            {'name': 'Physics', 'code': 'PHY'},
            {'name': 'Chemistry', 'code': 'CHEM'},
            {'name': 'English', 'code': 'ENG'},
        ]

        for branch_data in branches_data:
            branch, created = Branch.objects.get_or_create(
                institution=institution,
                code=branch_data['code'],
                defaults={
                    'name': branch_data['name'],
                }
            )
            if created:
                self.stdout.write(f'Created branch: {branch.name}')
        
        # Create Subjects (reduced hours to fit in 30 slots per week)
        subjects_data = [
            {'name': 'Data Structures', 'code': 'CS101', 'credits': 3, 'dept_code': 'CS'},
            {'name': 'Algorithms', 'code': 'CS102', 'credits': 3, 'dept_code': 'CS'},
            {'name': 'Database Systems', 'code': 'CS201', 'credits': 3, 'dept_code': 'CS'},
            {'name': 'Calculus I', 'code': 'MATH101', 'credits': 3, 'dept_code': 'MATH'},
            {'name': 'Linear Algebra', 'code': 'MATH102', 'credits': 3, 'dept_code': 'MATH'},
            {'name': 'Mechanics', 'code': 'PHY101', 'credits': 3, 'dept_code': 'PHY'},
            {'name': 'Thermodynamics', 'code': 'PHY201', 'credits': 3, 'dept_code': 'PHY'},
            {'name': 'Organic Chemistry', 'code': 'CHEM101', 'credits': 3, 'dept_code': 'CHEM'},
            {'name': 'English Literature', 'code': 'ENG101', 'credits': 3, 'dept_code': 'ENG'},
        ]
        
        for subj_data in subjects_data:
            branch = Branch.objects.get(code=subj_data['dept_code'])
            subject, created = Subject.objects.get_or_create(
                code=subj_data['code'],
                defaults={
                    'name': subj_data['name'],
                    'branch': branch,
                    'credits': subj_data['credits'],
                    'theory_hours': subj_data['credits'] - 1,
                    'practical_hours': 1,
                    'semester': 1,
                    'type': 'core',
                    'weekly_hours': subj_data['credits'],
                }
            )
            if created:
                self.stdout.write(f'Created subject: {subject.name}')
        
        # Create Teachers with User objects
        teachers_data = [
            {'username': 'dr_vikram', 'email': 'vikram@college.edu.in', 'first_name': 'Vikram', 'last_name': 'Agarwal', 'branch_code': 'CS', 'employee_id': 'EMP001'},
            {'username': 'prof_kavita', 'email': 'kavita@college.edu.in', 'first_name': 'Kavita', 'last_name': 'Joshi', 'branch_code': 'CS', 'employee_id': 'EMP002'},
            {'username': 'dr_suresh', 'email': 'suresh@college.edu.in', 'first_name': 'Suresh', 'last_name': 'Reddy', 'branch_code': 'MATH', 'employee_id': 'EMP003'},
            {'username': 'prof_anita', 'email': 'anita@college.edu.in', 'first_name': 'Anita', 'last_name': 'Verma', 'branch_code': 'PHY', 'employee_id': 'EMP004'},
            {'username': 'dr_ramesh', 'email': 'ramesh@college.edu.in', 'first_name': 'Ramesh', 'last_name': 'Gupta', 'branch_code': 'CHEM', 'employee_id': 'EMP005'},
            {'username': 'prof_deepika', 'email': 'deepika@college.edu.in', 'first_name': 'Deepika', 'last_name': 'Singh', 'branch_code': 'ENG', 'employee_id': 'EMP006'},
        ]

        for teacher_data in teachers_data:
            # Create User first
            user, user_created = User.objects.get_or_create(
                username=teacher_data['username'],
                defaults={
                    'email': teacher_data['email'],
                    'first_name': teacher_data['first_name'],
                    'last_name': teacher_data['last_name'],
                    'role': 'faculty'
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {user.username}')

            # Create Teacher profile
            branch = Branch.objects.get(code=teacher_data['branch_code'])
            teacher, created = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    'employee_id': teacher_data['employee_id'],
                    'department': branch,
                    'designation': 'assistant_professor',
                    'max_hours_per_day': 6,
                    'max_hours_per_week': 24,
                    'availability': {
                        'monday': ['09:00-17:00'],
                        'tuesday': ['09:00-17:00'],
                        'wednesday': ['09:00-17:00'],
                        'thursday': ['09:00-17:00'],
                        'friday': ['09:00-17:00']
                    }
                }
            )
            if created:
                self.stdout.write(f'Created teacher: {teacher.user.get_full_name()}')

        # Create TeacherSubject relationships
        from timetable.models import TeacherSubject
        teacher_subject_assignments = [
            ('dr_vikram', ['CS101', 'CS102']),  # Dr. Vikram teaches Data Structures and Algorithms
            ('prof_kavita', ['CS201']),        # Prof. Kavita teaches Database Systems
            ('dr_suresh', ['MATH101', 'MATH102']),  # Dr. Suresh teaches Calculus and Linear Algebra
            ('prof_anita', ['PHY101', 'PHY201']),   # Prof. Anita teaches Mechanics and Thermodynamics
            ('dr_ramesh', ['CHEM101']),        # Dr. Ramesh teaches Organic Chemistry
            ('prof_deepika', ['ENG101']),      # Prof. Deepika teaches English Literature
        ]

        for username, subject_codes in teacher_subject_assignments:
            try:
                teacher = Teacher.objects.get(user__username=username)
                for subject_code in subject_codes:
                    try:
                        subject = Subject.objects.get(code=subject_code)
                        teacher_subject, created = TeacherSubject.objects.get_or_create(
                            teacher=teacher,
                            subject=subject,
                            defaults={
                                'preference_level': 5,  # High preference (1-5 scale)
                                'can_teach_practical': True,
                                'can_teach_theory': True
                            }
                        )
                        if created:
                            self.stdout.write(f'Assigned {teacher.user.get_full_name()} to {subject.name}')
                    except Subject.DoesNotExist:
                        self.stdout.write(f'Subject {subject_code} not found')
            except Teacher.DoesNotExist:
                self.stdout.write(f'Teacher {username} not found')
        
        # Create Rooms
        rooms_data = [
            {'code': 'A101', 'name': 'Computer Lab 1', 'capacity': 30, 'type': 'laboratory'},
            {'code': 'A102', 'name': 'Computer Lab 2', 'capacity': 30, 'type': 'laboratory'},
            {'code': 'B201', 'name': 'Lecture Hall 1', 'capacity': 60, 'type': 'classroom'},
            {'code': 'B202', 'name': 'Lecture Hall 2', 'capacity': 60, 'type': 'classroom'},
            {'code': 'C301', 'name': 'Physics Lab', 'capacity': 25, 'type': 'laboratory'},
            {'code': 'C302', 'name': 'Chemistry Lab', 'capacity': 25, 'type': 'laboratory'},
        ]

        for room_data in rooms_data:
            room, created = Room.objects.get_or_create(
                institution=institution,
                code=room_data['code'],
                defaults={
                    'name': room_data['name'],
                    'capacity': room_data['capacity'],
                    'type': room_data['type'],
                }
            )
            if created:
                self.stdout.write(f'Created room: {room.code} - {room.name}')
        
        # Create Class Groups
        class_groups_data = [
            {'name': 'CS-1A', 'year': 1, 'section': 'A', 'strength': 30, 'dept_code': 'CS'},
            {'name': 'MATH-1A', 'year': 1, 'section': 'A', 'strength': 25, 'dept_code': 'MATH'},
            {'name': 'PHY-1A', 'year': 1, 'section': 'A', 'strength': 28, 'dept_code': 'PHY'},
            {'name': 'CHEM-1A', 'year': 1, 'section': 'A', 'strength': 22, 'dept_code': 'CHEM'},
            {'name': 'ENG-1A', 'year': 1, 'section': 'A', 'strength': 35, 'dept_code': 'ENG'},
        ]
        
        for group_data in class_groups_data:
            branch = Branch.objects.get(code=group_data['dept_code'])
            group, created = ClassGroup.objects.get_or_create(
                name=group_data['name'],
                defaults={
                    'branch': branch,
                    'year': group_data['year'],
                    'section': group_data['section'],
                    'strength': group_data['strength'],
                }
            )
            if created:
                self.stdout.write(f'Created class group: {group.name}')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write(f'Institution: {Institution.objects.count()}')
        self.stdout.write(f'Branches: {Branch.objects.count()}')
        self.stdout.write(f'Subjects: {Subject.objects.count()}')
        self.stdout.write(f'Teachers: {Teacher.objects.count()}')
        self.stdout.write(f'Rooms: {Room.objects.count()}')
        self.stdout.write(f'Class Groups: {ClassGroup.objects.count()}')
