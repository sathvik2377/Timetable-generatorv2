#!/usr/bin/env python3
"""
Comprehensive test script for all 9 setup modes in NEP 2020 Timetable Generator
Tests each setup mode end-to-end including generation and commit functionality
"""

import requests
import json
import time
from datetime import datetime

class TimetableSystemTester:
    def __init__(self):
        self.base_url = 'http://localhost:8000'
        self.token = None
        self.headers = {}
        
    def authenticate(self):
        """Get admin authentication token"""
        print("🔐 Authenticating as admin...")
        response = requests.post(f'{self.base_url}/api/auth/token/', {
            'email': 'admin@demo.local',
            'password': 'Admin@1234'
        })
        
        if response.status_code == 200:
            self.token = response.json().get('access')
            self.headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            print("✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return False
    
    def test_setup_mode(self, mode_name, test_data):
        """Test a specific setup mode"""
        print(f"\n🧪 Testing {mode_name} Setup Mode...")
        
        try:
            # Generate variants
            print(f"   📊 Generating timetable variants...")
            variant_response = requests.post(
                f'{self.base_url}/api/scheduler/generate-variants/',
                json=test_data,
                headers=self.headers
            )
            
            if variant_response.status_code not in [200, 201]:
                print(f"   ❌ Variant generation failed: {variant_response.status_code}")
                print(f"   Response: {variant_response.text[:200]}")
                return False
                
            variants = variant_response.json().get('variants', [])
            if not variants:
                print("   ❌ No variants generated")
                return False
                
            print(f"   ✅ Generated {len(variants)} variants")
            
            # Test commit functionality
            print(f"   💾 Testing commit functionality...")
            best_variant = max(variants, key=lambda v: v['metrics']['quality_score'])
            
            commit_data = {
                'variant': best_variant,
                'name': f'{mode_name} Test - {datetime.now().strftime("%H:%M:%S")}',
                'institution_id': 1
            }
            
            commit_response = requests.post(
                f'{self.base_url}/api/scheduler/commit-variant/',
                json=commit_data,
                headers=self.headers
            )
            
            if commit_response.status_code == 201:
                result = commit_response.json()
                print(f"   ✅ Commit successful - Timetable ID: {result.get('timetable_id')}")
                print(f"   📈 Quality Score: {best_variant['metrics']['quality_score']:.1f}%")
                print(f"   📚 Sessions: {result.get('sessions_created', 0)}")
                return True
            else:
                print(f"   ❌ Commit failed: {commit_response.status_code}")
                print(f"   Response: {commit_response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"   ❌ Error testing {mode_name}: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run tests for all 9 setup modes"""
        if not self.authenticate():
            return
            
        print("\n🚀 Starting comprehensive setup mode testing...")
        print("=" * 60)
        
        # Test data for different setup modes
        test_configs = {
            'Quick Setup': {
                'institution_id': 1,
                'name': 'Quick Setup Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Quick Test University',
                    'institutionType': 'university',
                    'numBranches': 2,
                    'numSubjectsPerBranch': 3,
                    'numTeachers': 4,
                    'numRooms': 5,
                    'startTime': '08:00',
                    'endTime': '16:00',
                    'workingDays': [1, 2, 3, 4, 5]
                }
            },
            'Smart Setup': {
                'institution_id': 1,
                'name': 'Smart Setup Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Smart AI University',
                    'institutionType': 'university',
                    'numBranches': 3,
                    'numSubjectsPerBranch': 4,
                    'numTeachers': 6,
                    'numRooms': 8,
                    'startTime': '08:00',
                    'endTime': '18:00',
                    'workingDays': [1, 2, 3, 4, 5],
                    'aiOptimization': True,
                    'preferenceWeight': 0.7
                }
            },
            'Batch Setup': {
                'institution_id': 1,
                'name': 'Batch Setup Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Batch Processing College',
                    'institutionType': 'college',
                    'numBranches': 4,
                    'numSubjectsPerBranch': 5,
                    'numTeachers': 8,
                    'numRooms': 10,
                    'startTime': '08:00',
                    'endTime': '17:00',
                    'workingDays': [1, 2, 3, 4, 5],
                    'batchProcessing': True
                }
            },
            'Unified Setup': {
                'institution_id': 1,
                'name': 'Unified Setup Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Unified Test Institute',
                    'institutionType': 'institute',
                    'numBranches': 2,
                    'numSubjectsPerBranch': 4,
                    'numTeachers': 5,
                    'numRooms': 6,
                    'startTime': '09:00',
                    'endTime': '17:00',
                    'workingDays': [1, 2, 3, 4, 5]
                }
            },
            'Simple Creator': {
                'institution_id': 1,
                'name': 'Simple Creator Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Simple Creator School',
                    'institutionType': 'school',
                    'numBranches': 2,
                    'numSubjectsPerBranch': 3,
                    'numTeachers': 4,
                    'numRooms': 5,
                    'startTime': '08:30',
                    'endTime': '15:30',
                    'workingDays': [1, 2, 3, 4, 5]
                }
            },
            'Excel Import': {
                'institution_id': 1,
                'name': 'Excel Import Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Excel Import College',
                    'institutionType': 'college',
                    'numBranches': 3,
                    'numSubjectsPerBranch': 4,
                    'numTeachers': 6,
                    'numRooms': 7,
                    'startTime': '09:00',
                    'endTime': '16:00',
                    'workingDays': [1, 2, 3, 4, 5],
                    'importMode': 'excel'
                }
            },
            'Advanced Setup': {
                'institution_id': 1,
                'name': 'Advanced Setup Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Advanced Research Institute',
                    'institutionType': 'institute',
                    'numBranches': 4,
                    'numSubjectsPerBranch': 6,
                    'numTeachers': 10,
                    'numRooms': 12,
                    'startTime': '08:00',
                    'endTime': '18:00',
                    'workingDays': [1, 2, 3, 4, 5, 6],
                    'advancedConstraints': True,
                    'multiObjective': True
                }
            },
            'Template Based': {
                'institution_id': 1,
                'name': 'Template Based Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Template University',
                    'institutionType': 'university',
                    'numBranches': 3,
                    'numSubjectsPerBranch': 5,
                    'numTeachers': 7,
                    'numRooms': 8,
                    'startTime': '08:30',
                    'endTime': '17:30',
                    'workingDays': [1, 2, 3, 4, 5],
                    'templateType': 'engineering'
                }
            },
            'Setup Wizard': {
                'institution_id': 1,
                'name': 'Setup Wizard Test',
                'semester': 1,
                'parameters': {
                    'institutionName': 'Wizard Guided College',
                    'institutionType': 'college',
                    'numBranches': 2,
                    'numSubjectsPerBranch': 4,
                    'numTeachers': 5,
                    'numRooms': 6,
                    'startTime': '09:00',
                    'endTime': '16:00',
                    'workingDays': [1, 2, 3, 4, 5],
                    'wizardMode': True
                }
            }
        }
        
        results = {}
        total_tests = len(test_configs)
        passed_tests = 0
        
        for mode_name, test_data in test_configs.items():
            success = self.test_setup_mode(mode_name, test_data)
            results[mode_name] = success
            if success:
                passed_tests += 1
            time.sleep(2)  # Brief pause between tests
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for mode_name, success in results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{mode_name:20} {status}")
        
        print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")
        
        if passed_tests == total_tests:
            print("🎉 ALL SETUP MODES WORKING PERFECTLY!")
        else:
            print(f"⚠️  {total_tests - passed_tests} setup modes need attention")
        
        return results

if __name__ == "__main__":
    tester = TimetableSystemTester()
    results = tester.run_all_tests()
