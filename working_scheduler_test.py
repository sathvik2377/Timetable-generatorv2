#!/usr/bin/env python3
"""
Working scheduler test - create a functional timetable for the API
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
from timetable.models import *
from ortools.sat.python import cp_model
from datetime import datetime, time, timedelta

User = get_user_model()

def create_working_timetable():
    print("🏗️ Creating Working Timetable for API Testing")
    
    institution = Institution.objects.first()
    admin_user = User.objects.get(email='admin@demo.local')
    
    # Get all data
    subjects = list(Subject.objects.all())
    teachers = list(Teacher.objects.all())
    rooms = list(Room.objects.all())
    class_groups = list(ClassGroup.objects.all())
    
    print(f"Data: {len(subjects)} subjects, {len(teachers)} teachers, {len(rooms)} rooms, {len(class_groups)} classes")
    
    # Create timetable
    timetable = Timetable.objects.create(
        name='Working Demo Timetable',
        institution=institution,
        generated_by=admin_user,
        academic_year='2024-25',
        semester=5,
        version=4,
        status='active',
        generation_time=timedelta(seconds=10),
        total_sessions=0,  # Will update later
        optimization_score=90.0
    )
    
    print(f"Created timetable: {timetable.name} (ID: {timetable.id})")
    
    # Simple scheduling logic
    session_count = 0
    current_day = 0
    current_hour = 9
    
    for class_group in class_groups:
        print(f"\nScheduling for {class_group.name} ({class_group.branch.name}):")
        
        # Get subjects for this class's branch
        class_subjects = [s for s in subjects if s.branch == class_group.branch]
        
        for subject in class_subjects:
            # Find teacher for this subject
            teacher = None
            for t in teachers:
                if t.subjects.filter(id=subject.id).exists():
                    teacher = t
                    break
            
            if not teacher:
                print(f"  ⚠️ No teacher found for {subject.name}")
                continue
            
            print(f"  📚 {subject.name}: {subject.weekly_hours} hours with {teacher.user.get_full_name()}")
            
            # Schedule sessions for this subject
            for session_num in range(subject.weekly_hours):
                # Find available room
                room = rooms[session_count % len(rooms)]
                
                # Skip lunch hour
                if current_hour == 12:
                    current_hour = 14
                
                # Create session
                session = TimetableSession.objects.create(
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
                
                day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                print(f"    - {day_names[current_day]} {current_hour}:00 in {room.name}")
                
                session_count += 1
                
                # Move to next time slot
                current_hour += 1
                if current_hour >= 17:  # End of day
                    current_hour = 9
                    current_day = (current_day + 1) % 5  # Next day
    
    # Update timetable session count
    timetable.total_sessions = session_count
    timetable.save()
    
    print(f"\n✅ Created {session_count} sessions")
    print(f"🎯 Timetable ready: http://localhost:8000/api/timetables/{timetable.id}/")
    
    return timetable.id

def create_multiple_variants():
    """Create 3 different timetable variants"""
    print("\n🔄 Creating Multiple Variants")
    
    variant_ids = []
    
    for variant_num in range(1, 4):
        print(f"\nCreating Variant {variant_num}...")
        
        institution = Institution.objects.first()
        admin_user = User.objects.get(email='admin@demo.local')
        
        # Create timetable
        timetable = Timetable.objects.create(
            name=f'Demo Variant {variant_num}',
            institution=institution,
            generated_by=admin_user,
            academic_year='2024-25',
            semester=5,
            version=4 + variant_num,
            status='active',
            generation_time=timedelta(seconds=5 + variant_num),
            total_sessions=0,
            optimization_score=85.0 + variant_num * 2
        )
        
        # Get data
        subjects = list(Subject.objects.all())
        teachers = list(Teacher.objects.all())
        rooms = list(Room.objects.all())
        class_groups = list(ClassGroup.objects.all())
        
        # Different scheduling strategy for each variant
        session_count = 0
        
        if variant_num == 1:
            # Variant 1: Morning-focused
            start_hour = 9
            day_offset = 0
        elif variant_num == 2:
            # Variant 2: Afternoon-focused  
            start_hour = 14
            day_offset = 1
        else:
            # Variant 3: Balanced
            start_hour = 11
            day_offset = 2
        
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
                    
                    session = TimetableSession.objects.create(
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
        
        timetable.total_sessions = session_count
        timetable.save()
        
        variant_ids.append(timetable.id)
        print(f"✅ Variant {variant_num} created with {session_count} sessions (ID: {timetable.id})")
    
    return variant_ids

if __name__ == "__main__":
    # Create main working timetable
    main_id = create_working_timetable()
    
    # Create variants
    variant_ids = create_multiple_variants()
    
    print(f"\n🎯 SUCCESS! Created timetables:")
    print(f"   Main: http://localhost:8000/api/timetables/{main_id}/")
    for i, vid in enumerate(variant_ids, 1):
        print(f"   Variant {i}: http://localhost:8000/api/timetables/{vid}/")
    
    print(f"\n🌐 Frontend can now test with these timetables!")
    print(f"   Login: admin@demo.local / Admin@1234")
    print(f"   Frontend: http://localhost:3001/")
