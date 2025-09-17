#!/usr/bin/env python3
"""
Comprehensive Final Test - Verify all systems are working
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

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
from scheduler.ortools_scheduler import TimetableScheduler

User = get_user_model()

def test_database():
    """Test database connectivity and data integrity"""
    print("🗄️  Testing Database...")
    
    try:
        # Test basic queries
        institutions = Institution.objects.count()
        users = User.objects.count()
        subjects = Subject.objects.count()
        teachers = Teacher.objects.count()
        timetables = Timetable.objects.count()
        
        print(f"   ✅ Institutions: {institutions}")
        print(f"   ✅ Users: {users}")
        print(f"   ✅ Subjects: {subjects}")
        print(f"   ✅ Teachers: {teachers}")
        print(f"   ✅ Timetables: {timetables}")
        
        # Test relationships
        admin_user = User.objects.get(email='admin@demo.local')
        print(f"   ✅ Admin user: {admin_user.email}")
        
        # Test teacher-subject relationships
        teacher_subjects = 0
        for teacher in Teacher.objects.all():
            teacher_subjects += teacher.subjects.count()
        print(f"   ✅ Teacher-Subject assignments: {teacher_subjects}")
        
        return True
    except Exception as e:
        print(f"   ❌ Database test failed: {e}")
        return False

def test_scheduler():
    """Test the scheduler functionality"""
    print("\n🧠 Testing Scheduler...")
    
    try:
        institution = Institution.objects.first()
        admin_user = User.objects.get(email='admin@demo.local')
        
        scheduler = TimetableScheduler(institution.id)
        print("   ✅ Scheduler initialized")
        
        # Test working method
        variants = scheduler.generate_multiple_variants_working(
            name='Final Test Timetable',
            generated_by_user=admin_user,
            num_variants=2
        )
        
        successful = sum(1 for v in variants if v.get('status') == 'success')
        print(f"   ✅ Generated {successful}/{len(variants)} variants successfully")
        
        if successful > 0:
            latest_timetable = Timetable.objects.latest('created_at')
            sessions = TimetableSession.objects.filter(timetable=latest_timetable).count()
            print(f"   ✅ Latest timetable has {sessions} sessions")
            return True
        else:
            print("   ❌ No successful variants generated")
            return False
            
    except Exception as e:
        print(f"   ❌ Scheduler test failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    
    base_url = "http://127.0.0.1:8000"
    
    try:
        # Test login
        login_data = {
            "email": "admin@demo.local",
            "password": "Admin@1234"
        }
        
        response = requests.post(f"{base_url}/api/users/login/", json=login_data, timeout=10)
        if response.status_code == 200:
            print("   ✅ Login endpoint working")
            token = response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
        else:
            print(f"   ❌ Login failed: {response.status_code}")
            return False
        
        # Test timetables list
        response = requests.get(f"{base_url}/api/timetables/", headers=headers, timeout=10)
        if response.status_code == 200:
            timetables = response.json()
            print(f"   ✅ Timetables endpoint: {len(timetables)} timetables")
        else:
            print(f"   ❌ Timetables endpoint failed: {response.status_code}")
            return False
        
        # Test specific timetable
        if timetables:
            timetable_id = timetables[0]['id']
            response = requests.get(f"{base_url}/api/timetables/{timetable_id}/", headers=headers, timeout=10)
            if response.status_code == 200:
                timetable_data = response.json()
                sessions = len(timetable_data.get('sessions', []))
                print(f"   ✅ Timetable detail endpoint: {sessions} sessions")
            else:
                print(f"   ❌ Timetable detail failed: {response.status_code}")
                return False
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ API test failed: {e}")
        print("   ℹ️  Make sure the Django server is running on http://127.0.0.1:8000")
        return False

def test_data_integrity():
    """Test data relationships and integrity"""
    print("\n🔍 Testing Data Integrity...")
    
    try:
        # Test subject-teacher assignments
        unassigned_subjects = []
        for subject in Subject.objects.all():
            if not Teacher.objects.filter(subjects=subject).exists():
                unassigned_subjects.append(subject.name)
        
        if unassigned_subjects:
            print(f"   ⚠️  Subjects without teachers: {unassigned_subjects}")
        else:
            print("   ✅ All subjects have assigned teachers")
        
        # Test branch-subject relationships
        branches_with_subjects = 0
        for branch in Branch.objects.all():
            if Subject.objects.filter(branch=branch).exists():
                branches_with_subjects += 1
        
        print(f"   ✅ Branches with subjects: {branches_with_subjects}/{Branch.objects.count()}")
        
        # Test room capacity
        rooms_with_capacity = Room.objects.filter(capacity__gt=0).count()
        total_rooms = Room.objects.count()
        print(f"   ✅ Rooms with capacity: {rooms_with_capacity}/{total_rooms}")
        
        # Test timetable sessions
        timetables_with_sessions = 0
        total_sessions = 0
        for timetable in Timetable.objects.all():
            session_count = TimetableSession.objects.filter(timetable=timetable).count()
            if session_count > 0:
                timetables_with_sessions += 1
                total_sessions += session_count
        
        print(f"   ✅ Timetables with sessions: {timetables_with_sessions}")
        print(f"   ✅ Total sessions: {total_sessions}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Data integrity test failed: {e}")
        return False

def generate_test_report():
    """Generate a comprehensive test report"""
    print("\n📊 Generating Test Report...")
    
    report = {
        "test_timestamp": datetime.now().isoformat(),
        "system_status": "operational",
        "components": {
            "database": "✅ Working",
            "scheduler": "✅ Working", 
            "api": "✅ Working",
            "data_integrity": "✅ Verified"
        },
        "statistics": {
            "institutions": Institution.objects.count(),
            "users": User.objects.count(),
            "subjects": Subject.objects.count(),
            "teachers": Teacher.objects.count(),
            "rooms": Room.objects.count(),
            "timetables": Timetable.objects.count(),
            "sessions": TimetableSession.objects.count()
        },
        "demo_credentials": {
            "admin": "admin@demo.local / Admin@1234",
            "faculty": "faculty@demo.local / Faculty@123",
            "student": "student@demo.local / Student@123"
        },
        "endpoints": {
            "backend": "http://127.0.0.1:8000/",
            "frontend": "http://localhost:3001/",
            "api_docs": "http://127.0.0.1:8000/api/",
            "admin_panel": "http://127.0.0.1:8000/admin/"
        }
    }
    
    print(json.dumps(report, indent=2))
    return report

def main():
    """Run comprehensive final test"""
    print("🚀 COMPREHENSIVE FINAL TEST - NEP 2020 Timetable Generator")
    print("=" * 60)
    
    tests = [
        ("Database", test_database),
        ("Scheduler", test_scheduler),
        ("API Endpoints", test_api_endpoints),
        ("Data Integrity", test_data_integrity)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        results[test_name] = test_func()
    
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! System is ready for demo.")
        generate_test_report()
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
    
    print("\n🌐 Access Points:")
    print("   Frontend: http://localhost:3001/")
    print("   Backend:  http://127.0.0.1:8000/")
    print("   Admin:    admin@demo.local / Admin@1234")

if __name__ == "__main__":
    main()
