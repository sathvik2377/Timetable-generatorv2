#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ortools.sat.python import cp_model
from timetable.models import *

def simple_test():
    print("=== SIMPLE OR-TOOLS TEST ===")
    
    # Get basic data
    subjects = list(Subject.objects.all()[:3])  # Just first 3 subjects
    teachers = list(Teacher.objects.all()[:3])  # Just first 3 teachers
    rooms = list(Room.objects.all()[:3])       # Just first 3 rooms
    class_groups = list(ClassGroup.objects.all()[:2])  # Just first 2 class groups
    
    print(f"Testing with: {len(subjects)} subjects, {len(teachers)} teachers, {len(rooms)} rooms, {len(class_groups)} class groups")
    
    # Create simple model
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()
    
    # Create variables: one per subject-teacher-room-class-day-time combination
    variables = {}
    time_slots = [(0, '09:00'), (0, '10:00'), (1, '09:00'), (1, '10:00')]  # Just 4 time slots
    
    for subject in subjects:
        for teacher in teachers:
            # Check if teacher can teach this subject
            if not teacher.subjects.filter(id=subject.id).exists():
                continue
                
            for room in rooms:
                for class_group in class_groups:
                    # Check basic compatibility
                    if subject.branch != class_group.branch:
                        continue
                    if room.capacity < class_group.strength:
                        continue
                        
                    for day, time in time_slots:
                        var_name = f"s{subject.id}_t{teacher.id}_r{room.id}_c{class_group.id}_d{day}_t{time}"
                        variables[var_name] = model.NewBoolVar(var_name)
    
    print(f"Created {len(variables)} variables")
    
    if len(variables) == 0:
        print("❌ No variables created - check subject-teacher assignments")
        return False
    
    # Add simple constraints
    
    # 1. Each subject-class combination gets exactly 1 session per week
    for subject in subjects:
        for class_group in class_groups:
            if subject.branch != class_group.branch:
                continue
                
            subject_class_vars = []
            for var_name, var in variables.items():
                if f"s{subject.id}_" in var_name and f"_c{class_group.id}_" in var_name:
                    subject_class_vars.append(var)
            
            if subject_class_vars:
                model.Add(sum(subject_class_vars) == 1)  # Exactly 1 session
                print(f"Added constraint: {subject.name} for {class_group.name} = 1 session")
    
    # 2. No teacher conflicts (teacher can't be in two places at once)
    for teacher in teachers:
        for day, time in time_slots:
            teacher_time_vars = []
            for var_name, var in variables.items():
                if f"_t{teacher.id}_" in var_name and f"_d{day}_t{time}" in var_name:
                    teacher_time_vars.append(var)
            
            if teacher_time_vars:
                model.Add(sum(teacher_time_vars) <= 1)  # At most 1 session per time slot
    
    # 3. No room conflicts
    for room in rooms:
        for day, time in time_slots:
            room_time_vars = []
            for var_name, var in variables.items():
                if f"_r{room.id}_" in var_name and f"_d{day}_t{time}" in var_name:
                    room_time_vars.append(var)
            
            if room_time_vars:
                model.Add(sum(room_time_vars) <= 1)  # At most 1 session per time slot
    
    print("Added basic constraints")
    
    # Solve
    print("Solving...")
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL:
        print("✅ OPTIMAL solution found!")
        
        # Print solution
        sessions = []
        for var_name, var in variables.items():
            if solver.Value(var) == 1:
                sessions.append(var_name)
        
        print(f"Scheduled {len(sessions)} sessions:")
        for session in sessions:
            print(f"  {session}")
        
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
    success = simple_test()
    if success:
        print("\n🎉 Simple test passed!")
    else:
        print("\n❌ Simple test failed!")
