#!/usr/bin/env python3
"""
Check database tables
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

from django.db import connection
from django.conf import settings

def check_database():
    try:
        print(f'Database path: {settings.DATABASES["default"]["NAME"]}')
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f'Tables in database ({len(tables)} total):')
        for table in tables:
            print(f'  - {table[0]}')

        # Check specifically for timetable tables
        timetable_tables = [t[0] for t in tables if 'timetable' in t[0]]
        print(f'\nTimetable tables: {timetable_tables}')
            
        # Check if we have any institutions
        try:
            from timetable.models import Institution
            institutions = Institution.objects.all()
            print(f'\nInstitutions in database: {institutions.count()}')
            for inst in institutions:
                print(f'  - {inst.name}')
        except Exception as e:
            print(f'Error checking institutions: {e}')
            
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    check_database()
