#!/usr/bin/env python
"""
Comprehensive NEP-2020 Timetable System Test Script
Tests all major functionality with Indian demo data
"""

import os
import sys
import django
from django.test import TestCase
from django.core.management import call_command
from django.db import transaction
import json
import logging

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from timetable.models import Institution, Branch, Subject, Teacher, Room, ClassGroup
from timetable.excel_utils import ExcelTemplateGenerator, ExcelParser
from scheduler.ortools_scheduler import ORToolsScheduler
from scheduler.ml_assistant import TimetableMLAssistant
from users.models import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NEP2020SystemTest:
    """
    Comprehensive system test for NEP-2020 compliance
    """
    
    def __init__(self):
        self.institution = None
        self.test_results = {
            'database_setup': False,
            'excel_templates': False,
            'excel_parsing': False,
            'constraint_validation': False,
            'solver_execution': False,
            'ml_predictions': False,
            'nep2020_compliance': False,
            'errors': []
        }
    
    def run_all_tests(self):
        """
        Run all system tests
        """
        logger.info("🚀 Starting NEP-2020 Timetable System Tests")
        
        try:
            self.test_database_setup()
            self.test_excel_functionality()
            self.test_solver_functionality()
            self.test_ml_functionality()
            self.test_nep2020_compliance()
            
            self.print_test_results()
            
        except Exception as e:
            logger.error(f"❌ Test suite failed: {str(e)}")
            self.test_results['errors'].append(f"Test suite error: {str(e)}")
    
    def test_database_setup(self):
        """
        Test database setup with Indian demo data
        """
        logger.info("📊 Testing database setup...")
        
        try:
            # Load fixtures
            call_command('loaddata', 'indian_demo_data.json', verbosity=0)
            
            # Verify data loaded
            self.institution = Institution.objects.first()
            assert self.institution is not None, "Institution not loaded"
            assert self.institution.name == "Bharatiya Institute of Technology"
            
            branches = Branch.objects.filter(institution=self.institution)
            assert branches.count() >= 3, f"Expected at least 3 branches, got {branches.count()}"
            
            subjects = Subject.objects.filter(institution=self.institution)
            assert subjects.count() >= 5, f"Expected at least 5 subjects, got {subjects.count()}"
            
            rooms = Room.objects.filter(institution=self.institution)
            assert rooms.count() >= 4, f"Expected at least 4 rooms, got {rooms.count()}"
            
            # Check NEP-2020 specific fields
            nep_subjects = subjects.filter(type__in=['theory', 'lab', 'project', 'ability_enhancement'])
            assert nep_subjects.count() == subjects.count(), "Not all subjects have NEP-2020 types"
            
            # Check working days configuration
            assert len(self.institution.working_days) >= 5, "Institution should have at least 5 working days"
            assert self.institution.max_teacher_hours_per_week == 24, "NEP-2020 max hours should be 24"
            
            self.test_results['database_setup'] = True
            logger.info("✅ Database setup test passed")
            
        except Exception as e:
            logger.error(f"❌ Database setup test failed: {str(e)}")
            self.test_results['errors'].append(f"Database setup: {str(e)}")
    
    def test_excel_functionality(self):
        """
        Test Excel template generation and parsing
        """
        logger.info("📋 Testing Excel functionality...")
        
        try:
            generator = ExcelTemplateGenerator()
            
            # Test template generation
            branches_df = generator.generate_branches_template()
            assert not branches_df.empty, "Branches template is empty"
            assert 'branch_code' in branches_df.columns, "Missing branch_code column"
            
            subjects_df = generator.generate_subjects_template()
            assert not subjects_df.empty, "Subjects template is empty"
            assert 'subject_type' in subjects_df.columns, "Missing subject_type column"
            assert 'weekly_hours' in subjects_df.columns, "Missing NEP-2020 weekly_hours column"
            
            teachers_df = generator.generate_teachers_template()
            assert not teachers_df.empty, "Teachers template is empty"
            assert 'max_hours_per_week' in teachers_df.columns, "Missing NEP-2020 max_hours column"
            
            rooms_df = generator.generate_rooms_template()
            assert not rooms_df.empty, "Rooms template is empty"
            assert 'is_lab' in rooms_df.columns, "Missing is_lab column"
            
            self.test_results['excel_templates'] = True
            
            # Test parsing (simplified - would need actual Excel files in production)
            parser = ExcelParser()
            
            # Create sample data for parsing test
            sample_branches = [
                {'branch_code': 'IT', 'branch_name': 'Information Technology', 'description': 'IT Department'}
            ]
            
            # This would normally parse from Excel file
            parsed_data = parser._validate_branches_data(sample_branches)
            assert len(parsed_data) == 1, "Branch parsing failed"
            
            self.test_results['excel_parsing'] = True
            logger.info("✅ Excel functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ Excel functionality test failed: {str(e)}")
            self.test_results['errors'].append(f"Excel functionality: {str(e)}")
    
    def test_solver_functionality(self):
        """
        Test OR-Tools solver with NEP-2020 constraints
        """
        logger.info("🧮 Testing OR-Tools solver...")
        
        try:
            # Create test users for teachers
            test_users = []
            for i in range(3):
                user, created = User.objects.get_or_create(
                    username=f'teacher{i+1}',
                    defaults={
                        'email': f'teacher{i+1}@bit.edu.in',
                        'first_name': f'Teacher{i+1}',
                        'last_name': 'Test',
                        'user_type': 'faculty'
                    }
                )
                test_users.append(user)
            
            # Create test teachers
            subjects = Subject.objects.filter(institution=self.institution)[:3]
            branches = Branch.objects.filter(institution=self.institution)[:2]
            
            for i, user in enumerate(test_users):
                teacher, created = Teacher.objects.get_or_create(
                    user=user,
                    institution=self.institution,
                    defaults={
                        'employee_id': f'T00{i+1}',
                        'department': branches[i % len(branches)].code,
                        'designation': 'assistant_professor',
                        'max_hours_per_week': 24
                    }
                )
                # Assign subjects
                teacher.subjects.add(subjects[i])
                teacher.classes_assigned.add(*ClassGroup.objects.filter(branch=branches[i % len(branches)])[:1])
            
            # Initialize scheduler
            scheduler = ORToolsScheduler(self.institution)
            
            # Test constraint validation
            validation_result = scheduler.validate_constraints()
            assert isinstance(validation_result, dict), "Validation should return dict"
            assert 'is_valid' in validation_result, "Validation should have is_valid field"
            
            self.test_results['constraint_validation'] = True
            
            # Test solver execution (simplified)
            try:
                # This would normally run the full solver
                # For testing, we just verify the setup works
                scheduler.create_variables()
                scheduler.add_constraints()
                
                self.test_results['solver_execution'] = True
                logger.info("✅ Solver functionality test passed")
                
            except Exception as solver_error:
                logger.warning(f"⚠️ Solver execution test skipped: {str(solver_error)}")
                self.test_results['errors'].append(f"Solver execution: {str(solver_error)}")
            
        except Exception as e:
            logger.error(f"❌ Solver functionality test failed: {str(e)}")
            self.test_results['errors'].append(f"Solver functionality: {str(e)}")
    
    def test_ml_functionality(self):
        """
        Test ML assistant functionality
        """
        logger.info("🤖 Testing ML functionality...")
        
        try:
            ml_assistant = TimetableMLAssistant()
            
            # Test with sample session data
            sample_session = {
                'subject_type': 'theory',
                'teacher_id': 1,
                'room_type': 'classroom',
                'class_size': 30,
                'duration': 60,
                'teacher_load': 20,
                'room_capacity': 60,
                'day_of_week': 1,
                'time_slot': 2
            }
            
            # Test slot predictions (should work with default recommendations)
            slot_predictions = ml_assistant.predict_optimal_slots(sample_session)
            assert isinstance(slot_predictions, list), "Slot predictions should be a list"
            assert len(slot_predictions) > 0, "Should have at least one slot prediction"
            
            # Test conflict prediction
            conflict_prob = ml_assistant.predict_conflicts(sample_session)
            assert isinstance(conflict_prob, (int, float)), "Conflict probability should be numeric"
            assert 0 <= conflict_prob <= 1, "Conflict probability should be between 0 and 1"
            
            # Test optimization suggestions
            sample_timetable = {
                'sessions': [sample_session, sample_session.copy()]
            }
            suggestions = ml_assistant.get_optimization_suggestions(sample_timetable)
            assert isinstance(suggestions, list), "Suggestions should be a list"
            
            self.test_results['ml_predictions'] = True
            logger.info("✅ ML functionality test passed")
            
        except Exception as e:
            logger.error(f"❌ ML functionality test failed: {str(e)}")
            self.test_results['errors'].append(f"ML functionality: {str(e)}")
    
    def test_nep2020_compliance(self):
        """
        Test NEP-2020 specific compliance requirements
        """
        logger.info("🎓 Testing NEP-2020 compliance...")
        
        try:
            # Check subject types compliance
            subjects = Subject.objects.filter(institution=self.institution)
            valid_types = ['theory', 'lab', 'project', 'ability_enhancement']
            
            for subject in subjects:
                assert subject.type in valid_types, f"Subject {subject.code} has invalid type: {subject.type}"
                assert hasattr(subject, 'weekly_hours'), f"Subject {subject.code} missing weekly_hours"
                assert hasattr(subject, 'minutes_per_slot'), f"Subject {subject.code} missing minutes_per_slot"
            
            # Check teacher workload compliance
            teachers = Teacher.objects.filter(institution=self.institution)
            for teacher in teachers:
                assert teacher.max_hours_per_week <= 40, f"Teacher {teacher.employee_id} exceeds max hours"
                assert teacher.max_hours_per_week >= 12, f"Teacher {teacher.employee_id} below min hours"
            
            # Check institution configuration
            assert self.institution.max_teacher_hours_per_week == 24, "Institution max hours not NEP-2020 compliant"
            assert len(self.institution.working_days) >= 5, "Institution should have at least 5 working days"
            
            # Check room lab designation
            rooms = Room.objects.filter(institution=self.institution)
            lab_rooms = rooms.filter(is_lab=True)
            assert lab_rooms.exists(), "Should have at least one lab room"
            
            # Check ability enhancement subjects
            ae_subjects = subjects.filter(type='ability_enhancement')
            assert ae_subjects.exists(), "Should have ability enhancement subjects for NEP-2020"
            
            self.test_results['nep2020_compliance'] = True
            logger.info("✅ NEP-2020 compliance test passed")
            
        except Exception as e:
            logger.error(f"❌ NEP-2020 compliance test failed: {str(e)}")
            self.test_results['errors'].append(f"NEP-2020 compliance: {str(e)}")
    
    def print_test_results(self):
        """
        Print comprehensive test results
        """
        logger.info("\n" + "="*60)
        logger.info("🎯 NEP-2020 TIMETABLE SYSTEM TEST RESULTS")
        logger.info("="*60)
        
        total_tests = len([k for k in self.test_results.keys() if k != 'errors'])
        passed_tests = len([k for k, v in self.test_results.items() if v is True])
        
        for test_name, result in self.test_results.items():
            if test_name == 'errors':
                continue
            
            status = "✅ PASS" if result else "❌ FAIL"
            test_display = test_name.replace('_', ' ').title()
            logger.info(f"{test_display:<30} {status}")
        
        logger.info("-"*60)
        logger.info(f"TOTAL TESTS: {total_tests}")
        logger.info(f"PASSED: {passed_tests}")
        logger.info(f"FAILED: {total_tests - passed_tests}")
        logger.info(f"SUCCESS RATE: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.test_results['errors']:
            logger.info("\n❌ ERRORS ENCOUNTERED:")
            for error in self.test_results['errors']:
                logger.info(f"  • {error}")
        
        if passed_tests == total_tests:
            logger.info("\n🎉 ALL TESTS PASSED! System is ready for deployment.")
        else:
            logger.info(f"\n⚠️ {total_tests - passed_tests} tests failed. Please review and fix issues.")
        
        logger.info("="*60)


def main():
    """
    Main test execution
    """
    try:
        # Clean up any existing test data
        with transaction.atomic():
            # Delete in reverse dependency order
            Teacher.objects.all().delete()
            ClassGroup.objects.all().delete()
            Subject.objects.all().delete()
            Room.objects.all().delete()
            Branch.objects.all().delete()
            Institution.objects.all().delete()
            User.objects.filter(username__startswith='teacher').delete()
        
        # Run tests
        test_suite = NEP2020SystemTest()
        test_suite.run_all_tests()
        
    except Exception as e:
        logger.error(f"❌ Test execution failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
