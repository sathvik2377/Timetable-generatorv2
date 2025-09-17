#!/usr/bin/env python3
"""
Test export functionality directly with existing timetable
"""

import requests
import json

def test_export_with_existing_timetable():
    """Test the backend export endpoints with existing timetable"""
    print("=== Testing Export Functionality (Direct) ===")
    
    # Login to get JWT token
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
        
        # Use existing timetable ID 3
        timetable_id = 3
        print(f"✅ Using existing timetable ID: {timetable_id}")
        
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
        analytics_url = f'http://localhost:8000/api/timetable/analytics/faculty-workload/?timetable_id={timetable_id}'
        analytics_response = requests.get(analytics_url, headers=headers)
        
        if analytics_response.status_code == 200:
            print("✅ Analytics export successful")
            analytics_data = analytics_response.json()
            print(f"   Faculty count: {len(analytics_data.get('faculty_workload', []))}")
        else:
            print(f"❌ Analytics export failed: {analytics_response.status_code}")
            print(f"   Error: {analytics_response.text[:200]}...")
            
        # Test room utilization analytics
        print(f"\n--- Testing Room Utilization Analytics ---")
        room_url = f'http://localhost:8000/api/timetable/analytics/room-utilization/?timetable_id={timetable_id}'
        room_response = requests.get(room_url, headers=headers)
        
        if room_response.status_code == 200:
            print("✅ Room utilization analytics successful")
            room_data = room_response.json()
            print(f"   Room count: {len(room_data.get('room_utilization', []))}")
        else:
            print(f"❌ Room utilization analytics failed: {room_response.status_code}")
            print(f"   Error: {room_response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main test function"""
    print("Testing Export Functionality (Direct)")
    print("=" * 50)
    
    test_export_with_existing_timetable()
    
    print("\n" + "=" * 50)
    print("Export functionality test completed!")

if __name__ == "__main__":
    main()
