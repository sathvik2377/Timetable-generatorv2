#!/usr/bin/env python3
"""
Comprehensive System Test for NEP 2020 Timetable Generator
Tests all critical functionality to ensure the system is working properly.
"""

import requests
import json
import time
import sys

class TimetableSystemTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3003"
        self.admin_token = None
        self.faculty_token = None
        self.student_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message
        })
        
    def test_authentication(self):
        """Test authentication for all user roles"""
        print("\n=== TESTING AUTHENTICATION ===")
        
        # Test admin login
        try:
            response = requests.post(f'{self.base_url}/api/auth/token/', {
                'email': 'admin@demo.local',
                'password': 'Admin@1234'
            })
            if response.status_code == 200:
                self.admin_token = response.json().get('access')
                self.log_test("Admin Authentication", True, "admin@demo.local login successful")
            else:
                self.log_test("Admin Authentication", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Admin Authentication", False, str(e))
            
        # Test faculty login
        try:
            response = requests.post(f'{self.base_url}/api/auth/token/', {
                'email': 'faculty@demo.local',
                'password': 'Faculty@123'
            })
            if response.status_code == 200:
                self.faculty_token = response.json().get('access')
                self.log_test("Faculty Authentication", True, "faculty@demo.local login successful")
            else:
                self.log_test("Faculty Authentication", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Faculty Authentication", False, str(e))
            
        # Test student login
        try:
            response = requests.post(f'{self.base_url}/api/auth/token/', {
                'email': 'student@demo.local',
                'password': 'Student@123'
            })
            if response.status_code == 200:
                self.student_token = response.json().get('access')
                self.log_test("Student Authentication", True, "student@demo.local login successful")
            else:
                self.log_test("Student Authentication", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Student Authentication", False, str(e))
    
    def test_timetable_generation(self):
        """Test timetable generation APIs"""
        print("\n=== TESTING TIMETABLE GENERATION ===")
        
        if not self.admin_token:
            self.log_test("Timetable Generation", False, "No admin token available")
            return
            
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        # Test Smart Setup
        smart_data = {
            'institution_id': 1,
            'name': 'Test Smart Setup',
            'semester': 1,
            'parameters': {
                'institutionName': 'Test University',
                'institutionType': 'university',
                'numBranches': 2,
                'numSubjectsPerBranch': 3,
                'numTeachers': 4,
                'numRooms': 5,
                'startTime': '08:00',
                'endTime': '18:00',
                'workingDays': [1, 2, 3, 4, 5]
            }
        }
        
        try:
            response = requests.post(f'{self.base_url}/api/scheduler/generate-variants/', 
                                   json=smart_data, headers=headers)
            if response.status_code in [200, 201]:
                result = response.json()
                variants = result.get('variants', [])
                self.log_test("Smart Setup Generation", True, f"Generated {len(variants)} variants")
            else:
                self.log_test("Smart Setup Generation", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Smart Setup Generation", False, str(e))
    
    def test_server_connectivity(self):
        """Test server connectivity"""
        print("\n=== TESTING SERVER CONNECTIVITY ===")
        
        # Test backend
        try:
            response = requests.get(f'{self.base_url}/api/')
            if response.status_code == 200:
                self.log_test("Backend Server", True, "Django backend responding")
            else:
                self.log_test("Backend Server", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Backend Server", False, str(e))
            
        # Test frontend (basic connectivity)
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                self.log_test("Frontend Server", True, "Next.js frontend responding")
            else:
                self.log_test("Frontend Server", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Frontend Server", False, str(e))
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*50)
        print("COMPREHENSIVE SYSTEM TEST SUMMARY")
        print("="*50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! System is fully functional.")
        else:
            print(f"\n⚠️  {total-passed} tests failed. Check the details above.")
            
        print(f"\nSystem URLs:")
        print(f"Frontend: {self.frontend_url}")
        print(f"Backend:  {self.base_url}")
        print(f"Admin:    {self.base_url}/admin/")
        
        print(f"\nDemo Credentials:")
        print(f"Admin:    admin@demo.local / Admin@1234")
        print(f"Faculty:  faculty@demo.local / Faculty@123")
        print(f"Student:  student@demo.local / Student@123")
    
    def run_all_tests(self):
        """Run all tests"""
        print("Starting Comprehensive System Test...")
        print("This will test authentication, timetable generation, and server connectivity.")
        
        self.test_server_connectivity()
        self.test_authentication()
        self.test_timetable_generation()
        self.print_summary()

if __name__ == "__main__":
    tester = TimetableSystemTester()
    tester.run_all_tests()
