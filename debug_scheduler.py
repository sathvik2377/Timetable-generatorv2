#!/usr/bin/env python3
"""
Debug scheduler issues
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from timetable.models import Institution
from scheduler.ortools_scheduler import TimetableScheduler

def debug_scheduler():
    try:
        # Get the institution
        institution = Institution.objects.first()
        print(f'Institution: {institution.name}')
        
        # Create scheduler
        scheduler = TimetableScheduler(institution.id)
        print('Scheduler created successfully')
        
        # Prepare data
        data = scheduler.prepare_data()
        print(f'Data prepared: {len(data.subjects)} subjects, {len(data.teachers)} teachers')
        
        # Create variables
        scheduler.create_variables()
        print(f'Variables created: {len(scheduler.variables)}')
        
        # Show a few variable names
        var_names = list(scheduler.variables.keys())[:5]
        print(f'Sample variable names: {var_names}')
        
        # Add constraints
        scheduler.add_constraints()
        print('Constraints added successfully')
        
        # Try to solve
        print('Attempting to solve...')
        solution = scheduler.solve()
        
        if solution:
            print('Solution found!')
            print(f'Sessions: {len(solution.get("sessions", []))}')
        else:
            print('No solution found')
            
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_scheduler()
