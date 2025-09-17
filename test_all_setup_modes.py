#!/usr/bin/env python3
"""
Comprehensive test script for all 9 setup modes
Tests each setup mode to ensure they work without errors
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3002"

def login():
    """Login and get JWT token"""
    login_data = {
        'email': 'admin@demo.local',
        'password': 'demo123'
    }

    try:
        response = requests.post(f"{BASE_URL}/api/auth/token/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_setup_mode(mode_name, token):
    """Test a specific setup mode"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test data for each setup mode
    test_data = {
        'setup_mode': mode_name,
        'institution_id': 1,
        'name': f'Test Timetable - {mode_name}',
        'form_data': {
            'institution_name': f'Test Institution - {mode_name}',
            'academic_year': '2024-25',
            'semester': 'Fall',
            'branches': ['Computer Science', 'Electronics'],
            'subjects': [
                {'name': 'Data Structures', 'code': 'CS101', 'credits': 4, 'type': 'theory'},
                {'name': 'Digital Electronics', 'code': 'EC101', 'credits': 3, 'type': 'theory'},
                {'name': 'Programming Lab', 'code': 'CS102', 'credits': 2, 'type': 'practical'}
            ],
            'teachers': [
                {'name': 'Dr. Smith', 'subjects': ['CS101', 'CS102']},
                {'name': 'Prof. Johnson', 'subjects': ['EC101']}
            ],
            'rooms': [
                {'name': 'Room 101', 'capacity': 60, 'type': 'classroom'},
                {'name': 'Lab 201', 'capacity': 30, 'type': 'lab'}
            ],
            'time_slots': [
                {'day': 'Monday', 'start_time': '09:00', 'end_time': '10:00'},
                {'day': 'Monday', 'start_time': '10:00', 'end_time': '11:00'},
                {'day': 'Tuesday', 'start_time': '09:00', 'end_time': '10:00'}
            ]
        }
    }
    
    try:
        print(f"  Testing {mode_name}...")
        response = requests.post(
            f"{BASE_URL}/api/scheduler/generate-variants/",
            headers=headers,
            json=test_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            variants = data.get('variants', [])
            successful_variants = [v for v in variants if v.get('status') in ['optimal', 'feasible']]

            print(f"    ✅ {mode_name}: Generated {len(successful_variants)} variants")
            if successful_variants:
                avg_score = sum(v.get('metrics', {}).get('quality_score', 0) for v in successful_variants) / len(successful_variants)
                total_conflicts = sum(v.get('metrics', {}).get('total_conflicts', 0) for v in successful_variants)
                print(f"    📊 Average quality: {avg_score:.1f}%, Total conflicts: {total_conflicts}")
            return True
        else:
            print(f"    ❌ {mode_name}: HTTP {response.status_code} - {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"    ⏰ {mode_name}: Request timeout (30s)")
        return False
    except Exception as e:
        print(f"    ❌ {mode_name}: Error - {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🧪 COMPREHENSIVE SETUP MODES TEST")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Login first
    print("1. 🔐 Testing Authentication...")
    token = login()
    if not token:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return
    print("   ✅ Login successful")
    print()
    
    # List of all 9 setup modes
    setup_modes = [
        'quick',
        'smart', 
        'batch',
        'unified',
        'simple_creator',
        'excel',
        'advanced',
        'template',
        'wizard'
    ]
    
    print("2. 🎯 Testing All Setup Modes...")
    results = {}
    
    for mode in setup_modes:
        success = test_setup_mode(mode, token)
        results[mode] = success
        time.sleep(1)  # Small delay between tests
    
    print()
    print("=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for success in results.values() if success)
    total = len(results)
    
    for mode, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{mode.upper():15} : {status}")
    
    print()
    print(f"📈 Overall Success Rate: {successful}/{total} ({successful/total*100:.1f}%)")
    
    if successful == total:
        print("🎉 ALL SETUP MODES ARE WORKING!")
        print("🚀 System is fully functional and ready for use.")
    else:
        failed_modes = [mode for mode, success in results.items() if not success]
        print(f"⚠️  Failed modes: {', '.join(failed_modes)}")
        print("🔧 Some setup modes need attention.")
    
    print()
    print("=" * 60)
    print("🌐 Access URLs:")
    print(f"   Frontend: {FRONTEND_URL}")
    print(f"   Backend:  {BASE_URL}")
    print("=" * 60)

if __name__ == "__main__":
    main()
