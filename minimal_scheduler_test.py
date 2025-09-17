#!/usr/bin/env python3
"""
Minimal scheduler test - just schedule one subject for one class
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

def minimal_scheduler_test():
    print("🧪 Minimal Scheduler Test - One Subject, One Class")
    
    institution = Institution.objects.first()
    print(f"Institution: {institution.name}")
    
    # Get one subject and one class
    cse_class = ClassGroup.objects.get(name='CSE-3A')
    data_structures = Subject.objects.get(name='Data Structures')
    alice = Teacher.objects.get(user__first_name='Alice')
    room = Room.objects.first()
    
    print(f"Subject: {data_structures.name} ({data_structures.weekly_hours} hours)")
    print(f"Teacher: {alice.user.get_full_name()}")
    print(f"Class: {cse_class.name}")
    print(f"Room: {room.name}")
    
    # Generate simple time slots
    time_slots = []
    for day in range(5):  # Mon-Fri
        for hour in range(9, 17):  # 9 AM to 5 PM
            if hour == 12 or hour == 13:  # Skip lunch
                continue
            time_slots.append((day, time(hour, 0)))
    
    print(f"Available time slots: {len(time_slots)}")
    
    # Create CP model
    model = cp_model.CpModel()
    
    # Variables: one for each time slot
    variables = {}
    for day, slot_time in time_slots:
        var_name = f"ds_{day}_{slot_time.hour}"
        variables[var_name] = model.NewBoolVar(var_name)
    
    print(f"Variables created: {len(variables)}")
    
    # Constraint: exactly 3 sessions (weekly hours for Data Structures)
    all_vars = list(variables.values())
    model.Add(sum(all_vars) == data_structures.weekly_hours)
    print(f"Constraint: exactly {data_structures.weekly_hours} sessions")
    
    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    
    print("Solving...")
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL:
        print("✅ OPTIMAL solution found!")
        
        # Show solution
        scheduled_sessions = []
        for var_name, var in variables.items():
            if solver.Value(var) == 1:
                parts = var_name.split('_')
                day = int(parts[1])
                hour = int(parts[2])
                day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                scheduled_sessions.append(f"{day_names[day]} {hour}:00")
        
        print(f"Scheduled sessions: {scheduled_sessions}")
        
        # Create actual timetable
        admin_user = User.objects.get(email='admin@demo.local')
        timetable = Timetable.objects.create(
            name='Minimal Test Timetable',
            institution=institution,
            generated_by=admin_user,
            academic_year='2024-25',
            semester=5,
            version=3,
            status='active',
            generation_time=timedelta(seconds=1),
            total_sessions=len(scheduled_sessions),
            optimization_score=100.0
        )
        
        # Create sessions
        for var_name, var in variables.items():
            if solver.Value(var) == 1:
                parts = var_name.split('_')
                day = int(parts[1])
                hour = int(parts[2])
                
                session = TimetableSession.objects.create(
                    timetable=timetable,
                    subject=data_structures,
                    teacher=alice,
                    room=room,
                    class_group=cse_class,
                    day_of_week=day,
                    start_time=time(hour, 0),
                    end_time=time(hour + 1, 0),
                    session_type='regular'
                )
        
        print(f"✅ Created timetable with ID: {timetable.id}")
        print(f"Access via: http://localhost:8000/api/timetables/{timetable.id}/")
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
    success = minimal_scheduler_test()
    if success:
        print("🎯 Minimal scheduler test PASSED!")
    else:
        print("💥 Minimal scheduler test FAILED!")
