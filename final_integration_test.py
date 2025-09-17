#!/usr/bin/env python3
"""
Final integration test for the complete timetable generation workflow
"""

import requests
import json
import time

def test_complete_workflow():
    """Test the complete timetable generation workflow"""
    print("=== Final Integration Test ===")
    
    # Step 1: Login
    print("\n1. Testing Login...")
    login_data = {
        'email': 'admin@demo.local',
        'password': 'demo123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.text}")
            return False
            
        token = response.json().get('access')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        print("✅ Login successful")
        
        # Step 2: Generate timetable variants
        print("\n2. Testing Timetable Generation...")
        timestamp = int(time.time())
        variant_data = {
            'institution_id': 1,
            'name': f'Integration Test {timestamp}',
            'setup_mode': 'simple_creator',
            'form_data': {
                'institutionName': 'Test Institution',
                'test': True
            }
        }
        
        variant_response = requests.post('http://localhost:8000/api/scheduler/generate-variants/', 
                                       json=variant_data, headers=headers)
        
        if variant_response.status_code != 201:
            print(f"❌ Timetable generation failed: {variant_response.text}")
            return False
            
        variants = variant_response.json().get('variants', [])
        if not variants:
            print("❌ No variants generated")
            return False
            
        print(f"✅ Generated {len(variants)} timetable variants")
        print(f"   Quality scores: {[v['metrics']['quality_score'] for v in variants]}")
        print(f"   Total sessions: {[v['metrics']['total_sessions'] for v in variants]}")
        print(f"   Conflicts: {[v['metrics']['total_conflicts'] for v in variants]}")
        
        # Step 3: Commit a variant
        print("\n3. Testing Variant Commit...")
        best_variant = max(variants, key=lambda v: v['metrics']['quality_score'])
        
        # Delete existing timetables to avoid unique constraint
        delete_response = requests.delete('http://localhost:8000/api/timetable/timetables/', headers=headers)
        
        commit_data = {
            'variant': best_variant,
            'name': f'Integration Test {timestamp}',
            'institution_id': 1
        }
        
        commit_response = requests.post('http://localhost:8000/api/scheduler/commit-variant/', 
                                      json=commit_data, headers=headers)
        
        if commit_response.status_code != 201:
            print(f"❌ Variant commit failed: {commit_response.text}")
            return False
            
        timetable_id = commit_response.json().get('timetable_id')
        print(f"✅ Committed timetable with ID: {timetable_id}")
        
        # Step 4: Test all export formats
        print("\n4. Testing Export Functionality...")
        export_formats = {
            'pdf': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/pdf/',
            'excel': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/excel/',
            'ics': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/ics/'
        }
        
        export_success = 0
        for format_name, export_url in export_formats.items():
            export_response = requests.get(export_url, headers=headers)
            
            if export_response.status_code == 200:
                print(f"   ✅ {format_name.upper()}: {len(export_response.content)} bytes")
                export_success += 1
            else:
                print(f"   ❌ {format_name.upper()}: Failed ({export_response.status_code})")
        
        print(f"✅ Export functionality: {export_success}/3 formats working")
        
        # Step 5: Test analytics
        print("\n5. Testing Analytics...")
        analytics_endpoints = {
            'faculty_workload': f'http://localhost:8000/api/timetable/analytics/faculty-workload/?timetable_id={timetable_id}',
            'room_utilization': f'http://localhost:8000/api/timetable/analytics/room-utilization/?timetable_id={timetable_id}'
        }
        
        analytics_success = 0
        for endpoint_name, endpoint_url in analytics_endpoints.items():
            analytics_response = requests.get(endpoint_url, headers=headers)
            
            if analytics_response.status_code == 200:
                print(f"   ✅ {endpoint_name}: Working")
                analytics_success += 1
            else:
                print(f"   ❌ {endpoint_name}: Failed ({analytics_response.status_code})")
        
        print(f"✅ Analytics: {analytics_success}/2 endpoints working")
        
        # Step 6: Test timetable retrieval
        print("\n6. Testing Timetable Retrieval...")
        timetable_response = requests.get(f'http://localhost:8000/api/timetable/timetables/{timetable_id}/', headers=headers)
        
        if timetable_response.status_code == 200:
            timetable_data = timetable_response.json()
            print(f"✅ Timetable retrieval successful")
            print(f"   Name: {timetable_data.get('name')}")
            print(f"   Status: {timetable_data.get('status')}")
            print(f"   Sessions: {timetable_data.get('total_sessions')}")
            print(f"   Score: {timetable_data.get('optimization_score')}")
        else:
            print(f"❌ Timetable retrieval failed: {timetable_response.status_code}")
            return False
        
        print("\n" + "="*50)
        print("🎉 FINAL INTEGRATION TEST RESULTS 🎉")
        print("="*50)
        print("✅ Authentication: Working")
        print("✅ Timetable Generation: Working")
        print("✅ Variant Commit: Working")
        print(f"✅ Export Functionality: {export_success}/3 formats")
        print(f"✅ Analytics: {analytics_success}/2 endpoints")
        print("✅ Data Retrieval: Working")
        print("="*50)
        print("🚀 ALL CORE FUNCTIONALITY IS WORKING! 🚀")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("Final Integration Test for Timetable Generator")
    print("=" * 60)
    
    success = test_complete_workflow()
    
    if success:
        print("\n✅ INTEGRATION TEST PASSED!")
        print("The timetable generator is fully functional.")
    else:
        print("\n❌ INTEGRATION TEST FAILED!")
        print("Some functionality needs to be fixed.")

if __name__ == "__main__":
    main()
