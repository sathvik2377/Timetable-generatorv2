#!/usr/bin/env python3
"""
Create admin user for testing
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_admin_user():
    User = get_user_model()
    
    # Check existing users
    print('Existing users:')
    for user in User.objects.all():
        print(f'  Email: {user.email}, Role: {getattr(user, "role", "N/A")}, Active: {user.is_active}')
    
    # Create or update admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@demo.local',
        defaults={
            'role': 'admin',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print('New admin user created')
    else:
        admin_user.set_password('admin123')
        admin_user.is_active = True
        admin_user.save()
        print('Admin user password updated and activated')
    
    print(f'Admin user: {admin_user.email}, Active: {admin_user.is_active}')

if __name__ == "__main__":
    create_admin_user()
