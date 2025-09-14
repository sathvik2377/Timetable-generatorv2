"""
Excel utilities for NEP-2020 compliant timetable generation
Uses Pandas for free Excel processing
"""

import pandas as pd
import io
from typing import Dict, List, Any, Optional
from django.core.exceptions import ValidationError
from .models import Institution, Branch, Subject, Teacher, Room


class ExcelTemplateGenerator:
    """Generate Excel templates for bulk data entry"""
    
    @staticmethod
    def generate_branches_template() -> pd.DataFrame:
        """Generate branches template with sample data"""
        template_data = {
            'branch_code': ['CSE', 'ECE', 'ME', 'CE'],
            'branch_name': ['Computer Science Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering'],
            'description': ['Computer Science and Engineering Department', 'Electronics and Communication Department', 'Mechanical Engineering Department', 'Civil Engineering Department']
        }
        return pd.DataFrame(template_data)
    
    @staticmethod
    def generate_subjects_template() -> pd.DataFrame:
        """Generate subjects template with NEP-2020 compliant fields"""
        template_data = {
            'subject_code': ['CS101', 'CS102', 'CS201L', 'CS301P', 'GE101'],
            'subject_name': ['Programming Fundamentals', 'Data Structures', 'Database Lab', 'Final Year Project', 'Environmental Science'],
            'branch_code': ['CSE', 'CSE', 'CSE', 'CSE', 'CSE'],
            'credits': [4, 4, 2, 6, 3],
            'type': ['theory', 'theory', 'lab', 'project', 'ability_enhancement'],
            'weekly_hours': [4, 4, 3, 6, 3],
            'minutes_per_slot': [60, 60, 120, 180, 60],
            'semester': [1, 2, 3, 7, 1],
            'year': [1, 1, 2, 4, 1],
            'theory_hours': [4, 4, 0, 2, 3],
            'practical_hours': [0, 0, 3, 4, 0],
            'tutorial_hours': [0, 0, 0, 0, 0]
        }
        return pd.DataFrame(template_data)
    
    @staticmethod
    def generate_teachers_template() -> pd.DataFrame:
        """Generate teachers template with Indian names and NEP-2020 fields"""
        template_data = {
            'teacher_id': ['T001', 'T002', 'T003', 'T004', 'T005'],
            'teacher_name': ['Dr. Arjun Sharma', 'Prof. Priya Patel', 'Dr. Anjali Singh', 'Mr. Vikram Kumar', 'Ms. Kavya Reddy'],
            'email': ['arjun.sharma@college.edu', 'priya.patel@college.edu', 'anjali.singh@college.edu', 'vikram.kumar@college.edu', 'kavya.reddy@college.edu'],
            'department': ['CSE', 'CSE', 'ECE', 'ME', 'CE'],
            'designation': ['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'assistant_professor'],
            'specialization': ['Machine Learning', 'Database Systems', 'VLSI Design', 'Thermodynamics', 'Structural Engineering'],
            'max_hours_per_week': [20, 22, 24, 18, 20],
            'subjects_taught': ['CS101,CS102', 'CS201L,CS102', 'EC101,EC102', 'ME101,ME102', 'CE101,GE101'],
            'classes_assigned': ['CSE', 'CSE', 'ECE', 'ME', 'CE'],
            'availability': ['{"Mon": ["09:00-17:00"], "Tue": ["09:00-17:00"], "Wed": ["09:00-17:00"], "Thu": ["09:00-17:00"], "Fri": ["09:00-17:00"]}'] * 5
        }
        return pd.DataFrame(template_data)
    
    @staticmethod
    def generate_rooms_template() -> pd.DataFrame:
        """Generate rooms template with lab facilities"""
        template_data = {
            'room_code': ['CR101', 'CR102', 'LAB201', 'LAB202', 'SH301'],
            'room_name': ['Classroom 101', 'Classroom 102', 'Computer Lab 1', 'Electronics Lab', 'Seminar Hall'],
            'type': ['classroom', 'classroom', 'laboratory', 'laboratory', 'seminar_hall'],
            'capacity': [60, 80, 30, 25, 150],
            'building': ['Block A', 'Block A', 'Block B', 'Block B', 'Block C'],
            'floor': [1, 1, 2, 2, 3],
            'has_projector': [True, True, True, True, True],
            'has_computer': [False, False, True, True, False],
            'has_whiteboard': [True, True, True, True, True],
            'has_ac': [True, True, True, False, True]
        }
        return pd.DataFrame(template_data)


class ExcelParser:
    """Parse Excel files for bulk data import"""
    
    def __init__(self, institution_id: int):
        self.institution = Institution.objects.get(id=institution_id)
    
    def parse_branches(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Parse branches from Excel file"""
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Validate required columns
            required_columns = ['branch_code', 'branch_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Missing required columns: {missing_columns}")
            
            branches = []
            for _, row in df.iterrows():
                if pd.isna(row['branch_code']) or pd.isna(row['branch_name']):
                    continue
                    
                branch_data = {
                    'institution': self.institution.id,
                    'code': str(row['branch_code']).strip(),
                    'name': str(row['branch_name']).strip(),
                    'description': str(row.get('description', '')).strip() if not pd.isna(row.get('description')) else ''
                }
                branches.append(branch_data)
            
            return branches
            
        except Exception as e:
            raise ValidationError(f"Error parsing branches Excel file: {str(e)}")
    
    def parse_subjects(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Parse subjects from Excel file with NEP-2020 compliance"""
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Validate required columns
            required_columns = ['subject_code', 'subject_name', 'branch_code', 'type', 'weekly_hours', 'minutes_per_slot']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Missing required columns: {missing_columns}")
            
            subjects = []
            for _, row in df.iterrows():
                if pd.isna(row['subject_code']) or pd.isna(row['subject_name']):
                    continue
                
                # Find branch by code
                try:
                    branch = Branch.objects.get(code=str(row['branch_code']).strip(), institution=self.institution)
                except Branch.DoesNotExist:
                    continue  # Skip if branch doesn't exist
                
                subject_data = {
                    'branch': branch.id,
                    'code': str(row['subject_code']).strip(),
                    'name': str(row['subject_name']).strip(),
                    'type': str(row['type']).strip(),
                    'credits': int(row.get('credits', 3)),
                    'semester': int(row.get('semester', 1)),
                    'year': int(row.get('year', 1)),
                    'weekly_hours': int(row['weekly_hours']),
                    'minutes_per_slot': int(row['minutes_per_slot']),
                    'theory_hours': int(row.get('theory_hours', 0)),
                    'practical_hours': int(row.get('practical_hours', 0)),
                    'tutorial_hours': int(row.get('tutorial_hours', 0))
                }
                subjects.append(subject_data)
            
            return subjects
            
        except Exception as e:
            raise ValidationError(f"Error parsing subjects Excel file: {str(e)}")
    
    def parse_teachers(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Parse teachers from Excel file with NEP-2020 compliance"""
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Validate required columns
            required_columns = ['teacher_id', 'teacher_name', 'department']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Missing required columns: {missing_columns}")
            
            teachers = []
            for _, row in df.iterrows():
                if pd.isna(row['teacher_id']) or pd.isna(row['teacher_name']):
                    continue
                
                # Find department by code
                try:
                    department = Branch.objects.get(code=str(row['department']).strip(), institution=self.institution)
                except Branch.DoesNotExist:
                    continue  # Skip if department doesn't exist
                
                teacher_data = {
                    'employee_id': str(row['teacher_id']).strip(),
                    'name': str(row['teacher_name']).strip(),
                    'email': str(row.get('email', '')).strip() if not pd.isna(row.get('email')) else '',
                    'department': department.id,
                    'designation': str(row.get('designation', 'assistant_professor')).strip(),
                    'specialization': str(row.get('specialization', '')).strip() if not pd.isna(row.get('specialization')) else '',
                    'max_hours_per_week': int(row.get('max_hours_per_week', self.institution.max_teacher_hours_per_week)),
                    'subjects_taught': str(row.get('subjects_taught', '')).strip() if not pd.isna(row.get('subjects_taught')) else '',
                    'classes_assigned': str(row.get('classes_assigned', '')).strip() if not pd.isna(row.get('classes_assigned')) else '',
                    'availability': str(row.get('availability', '{}')).strip() if not pd.isna(row.get('availability')) else '{}'
                }
                teachers.append(teacher_data)
            
            return teachers
            
        except Exception as e:
            raise ValidationError(f"Error parsing teachers Excel file: {str(e)}")
    
    def parse_rooms(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Parse rooms from Excel file"""
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Validate required columns
            required_columns = ['room_code', 'room_name', 'type', 'capacity']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValidationError(f"Missing required columns: {missing_columns}")
            
            rooms = []
            for _, row in df.iterrows():
                if pd.isna(row['room_code']) or pd.isna(row['room_name']):
                    continue
                
                room_data = {
                    'institution': self.institution.id,
                    'code': str(row['room_code']).strip(),
                    'name': str(row['room_name']).strip(),
                    'type': str(row['type']).strip(),
                    'capacity': int(row['capacity']),
                    'building': str(row.get('building', '')).strip() if not pd.isna(row.get('building')) else '',
                    'floor': int(row.get('floor', 1)),
                    'has_projector': bool(row.get('has_projector', False)),
                    'has_computer': bool(row.get('has_computer', False)),
                    'has_whiteboard': bool(row.get('has_whiteboard', True)),
                    'has_ac': bool(row.get('has_ac', False))
                }
                rooms.append(room_data)
            
            return rooms
            
        except Exception as e:
            raise ValidationError(f"Error parsing rooms Excel file: {str(e)}")
