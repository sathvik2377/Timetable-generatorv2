#!/usr/bin/env python3
"""
Setup sample data for testing the timetable generator
"""

import os
import sys
import django
from datetime import time

# Change to backend directory
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)

# Add the backend directory to the path
sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from timetable.models import Institution, Branch, Subject, Teacher, Room, ClassGroup, TeacherSubject
from scheduler.ortools_scheduler import TimetableScheduler

User = get_user_model()

def setup_sample_data():
    print("🚀 Setting up sample data for timetable generator...")
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@demo.local',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('Admin@1234')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.email}")
    else:
        print(f"✅ Admin user already exists: {admin_user.email}")
    
    # Create institution
    institution, created = Institution.objects.get_or_create(
        name='Demo Engineering College',
        defaults={
            'type': 'college',
            'address': '123 Education Street, Tech City',
            'phone': '+91-123-456-7890',
            'email': 'info@democollege.edu',
            'start_time': time(9, 0),
            'end_time': time(17, 0),
            'lunch_break_start': time(13, 0),
            'lunch_break_end': time(14, 0),
            'working_days': ["Mon", "Tue", "Wed", "Thu", "Fri"]
        }
    )
    print(f"✅ Institution: {institution.name}")
    
    # Create branches
    branches_data = [
        {'name': 'Computer Science Engineering', 'code': 'CSE'},
        {'name': 'Electronics and Communication', 'code': 'ECE'},
        {'name': 'Mechanical Engineering', 'code': 'MECH'},
    ]
    
    branches = []
    for branch_data in branches_data:
        branch, created = Branch.objects.get_or_create(
            code=branch_data['code'],
            institution=institution,
            defaults={
                'name': branch_data['name'],
                'description': f"Department of {branch_data['name']}"
            }
        )
        branches.append(branch)
        print(f"✅ Branch: {branch.name} ({branch.code})")
    
    # Create subjects
    subjects_data = [
        {'name': 'Data Structures', 'code': 'CS301', 'credits': 4, 'type': 'theory', 'weekly_hours': 4, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'Database Management', 'code': 'CS302', 'credits': 3, 'type': 'theory', 'weekly_hours': 3, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'Computer Networks', 'code': 'CS303', 'credits': 3, 'type': 'theory', 'weekly_hours': 3, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'DS Lab', 'code': 'CS301L', 'credits': 2, 'type': 'lab', 'weekly_hours': 2, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'DBMS Lab', 'code': 'CS302L', 'credits': 2, 'type': 'lab', 'weekly_hours': 2, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'Mathematics III', 'code': 'MA301', 'credits': 4, 'type': 'theory', 'weekly_hours': 4, 'branch': branches[0], 'semester': 5, 'year': 3},
        {'name': 'Digital Electronics', 'code': 'EC301', 'credits': 3, 'type': 'theory', 'weekly_hours': 3, 'branch': branches[1], 'semester': 5, 'year': 3},
        {'name': 'Signals & Systems', 'code': 'EC302', 'credits': 4, 'type': 'theory', 'weekly_hours': 4, 'branch': branches[1], 'semester': 5, 'year': 3},
    ]

    subjects = []
    for subject_data in subjects_data:
        branch = subject_data.pop('branch')
        subject, created = Subject.objects.get_or_create(
            code=subject_data['code'],
            branch=branch,
            defaults=subject_data
        )
        subjects.append(subject)
        print(f"✅ Subject: {subject.name} ({subject.code})")
    
    # Create teachers
    teachers_data = [
        {'first_name': 'Alice', 'last_name': 'Johnson', 'email': 'alice@demo.edu', 'specialization': 'Data Structures', 'employee_id': 'EMP001', 'department': branches[0]},
        {'first_name': 'Bob', 'last_name': 'Smith', 'email': 'bob@demo.edu', 'specialization': 'Database Systems', 'employee_id': 'EMP002', 'department': branches[0]},
        {'first_name': 'Carol', 'last_name': 'Brown', 'email': 'carol@demo.edu', 'specialization': 'Computer Networks', 'employee_id': 'EMP003', 'department': branches[0]},
        {'first_name': 'David', 'last_name': 'Wilson', 'email': 'david@demo.edu', 'specialization': 'Mathematics', 'employee_id': 'EMP004', 'department': branches[0]},
        {'first_name': 'Eve', 'last_name': 'Davis', 'email': 'eve@demo.edu', 'specialization': 'Electronics', 'employee_id': 'EMP005', 'department': branches[1]},
    ]

    teachers = []
    for teacher_data in teachers_data:
        # Create user first
        user, user_created = User.objects.get_or_create(
            email=teacher_data['email'],
            defaults={
                'username': teacher_data['email'].split('@')[0],
                'first_name': teacher_data['first_name'],
                'last_name': teacher_data['last_name'],
                'role': 'faculty',
                'is_active': True
            }
        )
        if user_created:
            user.set_password('Faculty@123')
            user.save()

        # Create teacher profile
        teacher, created = Teacher.objects.get_or_create(
            employee_id=teacher_data['employee_id'],
            defaults={
                'user': user,
                'department': teacher_data['department'],
                'specialization': teacher_data['specialization'],
                'designation': 'assistant_professor',
                'max_hours_per_week': 20
            }
        )
        teachers.append(teacher)
        print(f"✅ Teacher: {user.get_full_name()} ({teacher.employee_id})")
    
    # Create rooms
    rooms_data = [
        {'name': 'Room 101', 'code': 'R101', 'type': 'classroom', 'capacity': 60},
        {'name': 'Room 102', 'code': 'R102', 'type': 'classroom', 'capacity': 60},
        {'name': 'Room 103', 'code': 'R103', 'type': 'classroom', 'capacity': 60},
        {'name': 'Lab 201', 'code': 'L201', 'type': 'laboratory', 'capacity': 30},
        {'name': 'Lab 202', 'code': 'L202', 'type': 'laboratory', 'capacity': 30},
    ]
    
    rooms = []
    for room_data in rooms_data:
        room, created = Room.objects.get_or_create(
            code=room_data['code'],
            institution=institution,
            defaults=room_data
        )
        rooms.append(room)
        print(f"✅ Room: {room.name} ({room.type})")
    
    # Create class groups
    class_groups = []
    for branch in branches[:2]:  # Only CSE and ECE for demo
        for year in [3]:  # Only 3rd year
            for section in ['A']:  # Only section A
                class_group, created = ClassGroup.objects.get_or_create(
                    name=f"{branch.code}-{year}{section}",
                    branch=branch,
                    year=year,
                    section=section,
                    defaults={
                        'semester': 5,
                        'strength': 60
                    }
                )
                class_groups.append(class_group)
                print(f"✅ Class Group: {class_group.name}")
    
    # Assign subjects to teachers
    teacher_subject_assignments = [
        (teachers[0], subjects[0]),  # Alice -> Data Structures
        (teachers[0], subjects[3]),  # Alice -> DS Lab
        (teachers[1], subjects[1]),  # Bob -> Database Management
        (teachers[1], subjects[4]),  # Bob -> DBMS Lab
        (teachers[2], subjects[2]),  # Carol -> Computer Networks
        (teachers[3], subjects[5]),  # David -> Mathematics III
        (teachers[4], subjects[6]),  # Eve -> Digital Electronics
        (teachers[4], subjects[7]),  # Eve -> Signals & Systems
    ]
    
    for teacher, subject in teacher_subject_assignments:
        teacher_subject, created = TeacherSubject.objects.get_or_create(
            teacher=teacher,
            subject=subject,
            defaults={'preference_level': 5}
        )
        print(f"✅ Assignment: {teacher.user.get_full_name()} -> {subject.name}")
    
    print(f"\n🎉 Sample data setup complete!")
    print(f"📊 Summary:")
    print(f"   - Institution: 1")
    print(f"   - Branches: {len(branches)}")
    print(f"   - Subjects: {len(subjects)}")
    print(f"   - Teachers: {len(teachers)}")
    print(f"   - Rooms: {len(rooms)}")
    print(f"   - Class Groups: {len(class_groups)}")
    print(f"   - Teacher-Subject Assignments: {len(teacher_subject_assignments)}")
    
    return institution

def test_scheduler(institution):
    print(f"\n🧪 Testing scheduler with institution: {institution.name}")
    
    try:
        scheduler = TimetableScheduler(institution.id)
        print("✅ Scheduler initialized")
        
        # Prepare data
        data = scheduler.prepare_data()
        print(f"✅ Data prepared: {len(data.subjects)} subjects, {len(data.teachers)} teachers, {len(data.rooms)} rooms")
        
        # Test variant generation
        print("🚀 Testing variant generation...")
        variants = scheduler.generate_multiple_variants(
            name="Test Timetable",
            generated_by_user=User.objects.get(email='admin@demo.local'),
            num_variants=2
        )
        
        print(f"✅ Generated {len(variants)} variants")
        for i, variant in enumerate(variants):
            print(f"   Variant {i+1}: {variant['status']}")
            if variant.get('metrics'):
                metrics = variant['metrics']
                print(f"     - Sessions: {metrics.get('total_sessions', 'N/A')}")
                print(f"     - Room utilization: {metrics.get('room_utilization_percent', 'N/A')}%")
        
        return variants
        
    except Exception as e:
        print(f"❌ Scheduler test failed: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    institution = setup_sample_data()
    variants = test_scheduler(institution)
    
    if variants:
        print(f"\n🎯 SUCCESS: Scheduler is working correctly!")
    else:
        print(f"\n❌ FAILED: Scheduler needs debugging")
