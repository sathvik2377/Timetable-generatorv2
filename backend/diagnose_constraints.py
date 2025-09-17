#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from timetable.models import *
from scheduler.ortools_scheduler import TimetableScheduler

def diagnose_constraints():
    print("=== CONSTRAINT DIAGNOSIS ===\n")
    
    # Get institution
    institution = Institution.objects.get(id=1)
    print(f"Institution: {institution.name}")
    print(f"Working days: {institution.working_days}")
    print(f"Start time: {institution.start_time}")
    print(f"End time: {institution.end_time}")
    print(f"Slot duration: {institution.slot_duration} minutes")
    print(f"Lunch break: {institution.lunch_break_start} - {institution.lunch_break_end}")
    
    # Calculate available slots per day
    from datetime import datetime, timedelta
    start = datetime.combine(datetime.today(), institution.start_time)
    end = datetime.combine(datetime.today(), institution.end_time)
    lunch_start = datetime.combine(datetime.today(), institution.lunch_break_start)
    lunch_end = datetime.combine(datetime.today(), institution.lunch_break_end)
    
    slot_duration = timedelta(minutes=institution.slot_duration)
    
    # Morning slots
    morning_slots = int((lunch_start - start).total_seconds() / slot_duration.total_seconds())
    # Afternoon slots
    afternoon_slots = int((end - lunch_end).total_seconds() / slot_duration.total_seconds())
    
    total_slots_per_day = morning_slots + afternoon_slots
    working_days = len(institution.working_days or [0, 1, 2, 3, 4])
    total_slots_per_week = total_slots_per_day * working_days
    
    print(f"Slots per day: {total_slots_per_day} (Morning: {morning_slots}, Afternoon: {afternoon_slots})")
    print(f"Working days: {working_days}")
    print(f"Total slots per week: {total_slots_per_week}")
    
    print("\n=== SUBJECTS AND REQUIREMENTS ===")
    subjects = Subject.objects.filter(branch__institution=institution)
    total_required_hours = 0
    
    for subject in subjects:
        weekly_hours = subject.weekly_hours or (subject.theory_hours + subject.practical_hours)
        total_required_hours += weekly_hours
        print(f"{subject.name} ({subject.branch.code}): {weekly_hours} hours/week")
    
    print(f"\nTotal required hours per week: {total_required_hours}")
    print(f"Available slots per week: {total_slots_per_week}")
    
    print("\n=== CLASS GROUPS ===")
    class_groups = ClassGroup.objects.filter(branch__institution=institution)
    for cg in class_groups:
        print(f"{cg.name} ({cg.branch.code}): {cg.strength} students, Year {cg.year}")
    
    print("\n=== TEACHERS AND SUBJECTS ===")
    teachers = Teacher.objects.filter(department__institution=institution)
    for teacher in teachers:
        subjects_taught = teacher.subjects.all()
        print(f"{teacher.user.get_full_name()} ({teacher.department.code}): {subjects_taught.count()} subjects")
        for ts in TeacherSubject.objects.filter(teacher=teacher):
            print(f"  - {ts.subject.name} (preference: {ts.preference_level})")
    
    print("\n=== ROOMS ===")
    rooms = Room.objects.filter(institution=institution, is_active=True)
    for room in rooms:
        print(f"{room.name} ({room.code}): capacity {room.capacity}, type {room.type}")
    
    print("\n=== POTENTIAL ISSUES ===")
    issues = []
    
    # Check if total required hours exceed available slots
    if total_required_hours > total_slots_per_week:
        issues.append(f"Over-scheduled: Need {total_required_hours} hours but only {total_slots_per_week} slots available")
    
    # Check room capacity vs class strength
    for cg in class_groups:
        suitable_rooms = [r for r in rooms if r.capacity >= cg.strength]
        if not suitable_rooms:
            issues.append(f"No suitable rooms for {cg.name} (strength: {cg.strength})")
        else:
            print(f"{cg.name} can use {len(suitable_rooms)} rooms")
    
    # Check if subjects have teachers
    for subject in subjects:
        teachers_for_subject = TeacherSubject.objects.filter(subject=subject).count()
        if teachers_for_subject == 0:
            issues.append(f"No teachers assigned to {subject.name}")
    
    if issues:
        print("\nISSUES FOUND:")
        for issue in issues:
            print(f"❌ {issue}")
    else:
        print("\n✅ No obvious constraint issues found")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = diagnose_constraints()
    if not success:
        print("\n🔧 Fix the issues above and try again")
    else:
        print("\n🎉 Constraints look feasible!")
