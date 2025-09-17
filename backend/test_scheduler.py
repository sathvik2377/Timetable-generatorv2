#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from scheduler.ortools_scheduler import TimetableScheduler
from users.models import User

def test_scheduler():
    print("Testing OR-Tools Scheduler...")
    
    try:
        # Initialize scheduler
        scheduler = TimetableScheduler(1)
        print("✓ Scheduler initialized")
        
        # Prepare data
        data = scheduler.prepare_data()
        print(f"✓ Data prepared: {len(data.subjects)} subjects, {len(data.teachers)} teachers, {len(data.rooms)} rooms")
        
        # Get admin user
        user = User.objects.get(username='admin')
        print("✓ Admin user found")
        
        # Generate variants
        print("Generating timetable variants...")
        variants = scheduler.generate_multiple_variants(
            name="Test Timetable", 
            generated_by_user=user, 
            num_variants=2
        )
        
        print(f"✓ Generated {len(variants)} variants")
        for i, variant in enumerate(variants):
            sessions = variant.get('sessions', [])
            quality = variant.get('quality_score', 0)
            print(f"  Variant {i+1}: {len(sessions)} sessions, Quality: {quality:.2f}")
            
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_scheduler()
    if success:
        print("\n🎉 Scheduler test completed successfully!")
    else:
        print("\n❌ Scheduler test failed!")
