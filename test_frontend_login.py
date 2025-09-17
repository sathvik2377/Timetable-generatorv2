#!/usr/bin/env python3
"""
Test frontend login flow
"""

import requests
import json

def test_frontend_login():
    """Test the frontend login endpoint"""
    print("=== Testing Frontend Login Flow ===")
    
    # Test the JWT token endpoint that frontend now uses
    login_data = {
        'email': 'admin@demo.local',
        'password': 'demo123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        print(f"JWT Token Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ JWT Token endpoint working!")
            print(f"Response keys: {list(data.keys())}")
            
            # Test if we can use the token to access protected endpoints
            token = data.get('access')
            if token:
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                # Test simple creator endpoint
                variant_data = {
                    'institution_id': 1,
                    'name': 'Frontend Test',
                    'setup_mode': 'simple_creator',
                    'form_data': {
                        'institutionName': 'Test Institution',
                        'test': True
                    }
                }
                
                variant_response = requests.post('http://localhost:8000/api/scheduler/generate-variants/', 
                                               json=variant_data, headers=headers)
                print(f"Simple Creator API Status: {variant_response.status_code}")
                
                if variant_response.status_code == 201:
                    result = variant_response.json()
                    print("✅ Simple Creator API working!")
                    print(f"Generated {len(result.get('variants', []))} variants")
                else:
                    print(f"❌ Simple Creator API failed: {variant_response.text[:200]}...")
                    
        else:
            print(f"❌ JWT Token failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main test function"""
    print("Testing Frontend Login Integration")
    print("=" * 50)
    
    test_frontend_login()
    
    print("\n" + "=" * 50)
    print("Frontend login test completed!")

if __name__ == "__main__":
    main()
