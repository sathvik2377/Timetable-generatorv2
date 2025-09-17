#!/usr/bin/env python3
"""
Test export functionality for timetables
"""

import requests
import json

def test_export_endpoints():
    """Test the backend export endpoints"""
    print("=== Testing Export Functionality ===")
    
    # First, login to get JWT token
    login_data = {
        'email': 'admin@demo.local',
        'password': 'demo123'
    }
    
    try:
        # Login
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.text}")
            return
            
        token = response.json().get('access')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        print("✅ Login successful")
        
        # Generate a timetable first
        import time
        timestamp = int(time.time())
        variant_data = {
            'institution_id': 1,
            'name': f'Export Test Timetable {timestamp}',
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
            return
            
        variants = variant_response.json().get('variants', [])
        if not variants:
            print("❌ No variants generated")
            return
            
        print(f"✅ Generated {len(variants)} timetable variants")
        
        # Commit the first variant to create a timetable
        first_variant = variants[0]
        commit_data = {
            'variant': first_variant,
            'name': f'Export Test Timetable {timestamp}',
            'institution_id': 1,
            'academic_year': f'2024-{timestamp % 100}',
            'semester': 1,
            'version': timestamp % 1000
        }
        
        commit_response = requests.post('http://localhost:8000/api/scheduler/commit-variant/', 
                                      json=commit_data, headers=headers)
        
        if commit_response.status_code != 201:
            print(f"❌ Timetable commit failed: {commit_response.text}")
            return
            
        timetable_id = commit_response.json().get('timetable_id')
        print(f"✅ Committed timetable with ID: {timetable_id}")
        
        # Test export endpoints
        export_formats = {
            'pdf': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/pdf/',
            'excel': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/excel/',
            'ics': f'http://localhost:8000/api/timetable/timetables/{timetable_id}/export/ics/'
        }

        for format_name, export_url in export_formats.items():
            print(f"\n--- Testing {format_name.upper()} Export ---")

            export_response = requests.get(export_url, headers=headers)
            
            if export_response.status_code == 200:
                print(f"✅ {format_name.upper()} export successful")
                print(f"   Content-Type: {export_response.headers.get('Content-Type')}")
                print(f"   Content-Length: {len(export_response.content)} bytes")

                # Save the file for verification
                extension = 'xlsx' if format_name == 'excel' else format_name
                filename = f"test_export.{extension}"
                with open(filename, 'wb') as f:
                    f.write(export_response.content)
                print(f"   Saved as: {filename}")

            else:
                print(f"❌ {format_name.upper()} export failed: {export_response.status_code}")
                print(f"   Error: {export_response.text[:200]}...")
        
        # Test analytics export
        print(f"\n--- Testing Analytics Export ---")
        analytics_url = f'http://localhost:8000/api/timetable/analytics/faculty-workload/'
        analytics_response = requests.get(analytics_url, headers=headers)
        
        if analytics_response.status_code == 200:
            print("✅ Analytics export successful")
            analytics_data = analytics_response.json()
            print(f"   Faculty count: {len(analytics_data.get('faculty_workload', []))}")
        else:
            print(f"❌ Analytics export failed: {analytics_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main test function"""
    print("Testing Export Functionality")
    print("=" * 50)
    
    test_export_endpoints()
    
    print("\n" + "=" * 50)
    print("Export functionality test completed!")

if __name__ == "__main__":
    main()
