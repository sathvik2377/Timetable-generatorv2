"""
Django management command to create a demo admin user for testing
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a demo admin user for testing (admin/Admin@1234)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreate admin user if exists',
        )
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Admin username (default: admin)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Admin@1234',
            help='Admin password (default: Admin@1234)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@demo.local',
            help='Admin email (default: admin@demo.local)',
        )
    
    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']
        force = options['force']
        
        self.stdout.write(f'Creating demo admin user: {username}')
        
        try:
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                if force:
                    self.stdout.write(
                        self.style.WARNING(f'User {username} already exists. Deleting...')
                    )
                    User.objects.filter(username=username).delete()
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'User {username} already exists. Use --force to recreate.'
                        )
                    )
                    return
            
            # Create admin user
            admin_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name='Demo',
                last_name='Admin'
            )
            
            # Make user superuser and staff
            admin_user.is_staff = True
            admin_user.is_superuser = True
            
            # Set role if the User model has a role field
            if hasattr(admin_user, 'role'):
                # Check if User model has Role choices
                if hasattr(User, 'Role') and hasattr(User.Role, 'ADMIN'):
                    admin_user.role = User.Role.ADMIN
                elif hasattr(admin_user, 'role'):
                    # Try to set role as string if no enum
                    admin_user.role = 'admin'
            
            admin_user.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created demo admin user!\n'
                    f'Username: {username}\n'
                    f'Password: {password}\n'
                    f'Email: {email}\n'
                    f'\nYou can now login to:\n'
                    f'- Django Admin: http://localhost:8000/admin/\n'
                    f'- Application: http://localhost:3000/\n'
                    f'\n⚠️  WARNING: This is for TESTING ONLY! '
                    f'Change the password in production!'
                )
            )
            
        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Failed to create admin user due to database constraint: {e}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create admin user: {e}')
            )
