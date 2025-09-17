#!/usr/bin/env python3
"""
Test authentication and API endpoints
"""

import requests
import json

def test_login():
    """Test login functionality"""
    print("=== Testing Login ===")
    
    login_data = {
        'email': 'admin@demo.local',
        'password': 'demo123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"Response keys: {list(data.keys())}")
            print(f"Full response: {data}")
            # JWT token endpoint returns 'access' not 'access_token'
            token = data.get('access') or data.get('access_token')
            print(f"Access token: {token[:50] if token else 'N/A'}...")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_generate_variants(token):
    """Test generate variants endpoint"""
    print("\n=== Testing Generate Variants ===")
    
    if not token:
        print("❌ No token available")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    variant_data = {
        'institution_id': 1,
        'name': 'Test Timetable Generation',
        'setup_mode': 'simple_creator',
        'form_data': {
            'institutionName': 'Test Institution',
            'departments': ['Computer Science'],
            'test': True
        }
    }
    
    try:
        response = requests.post('http://localhost:8000/api/scheduler/generate-variants/', 
                               json=variant_data, headers=headers)
        print(f"Generate variants status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Generate variants successful!")
            print(f"Variants generated: {len(result.get('variants', []))}")
            if result.get('variants'):
                variant = result['variants'][0]
                print(f"First variant sessions: {len(variant.get('sessions', []))}")
                print(f"Quality score: {variant.get('quality_score', 'N/A')}")
        else:
            print(f"❌ Generate variants failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Generate variants error: {e}")

def main():
    """Main test function"""
    print("Testing Timetable Generator Authentication & API")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    # Test generate variants
    test_generate_variants(token)
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()
