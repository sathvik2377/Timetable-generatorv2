from rest_framework import serializers
from .models import (
    Institution, Branch, ClassGroup, Subject, Teacher, TeacherSubject,
    Room, Timetable, TimetableSession, TimetableConstraint
)
from users.serializers import UserSerializer


class InstitutionSerializer(serializers.ModelSerializer):
    """
    Institution serializer
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'type', 'type_display', 'address', 'phone', 'email', 'website',
            'academic_year', 'start_time', 'end_time', 'slot_duration',
            'lunch_break_start', 'lunch_break_end', 'working_days',
            'max_teacher_hours_per_week',  # NEP-2020 field
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BranchSerializer(serializers.ModelSerializer):
    """
    Branch serializer
    """
    head_name = serializers.CharField(source='head.get_full_name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    class Meta:
        model = Branch
        fields = [
            'id', 'institution', 'institution_name', 'name', 'code', 'description',
            'head', 'head_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassGroupSerializer(serializers.ModelSerializer):
    """
    Class group serializer
    """
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_code = serializers.CharField(source='branch.code', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.get_full_name', read_only=True)
    
    class Meta:
        model = ClassGroup
        fields = [
            'id', 'branch', 'branch_name', 'branch_code', 'name', 'year', 'section',
            'semester', 'strength', 'coordinator', 'coordinator_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    """
    Subject serializer
    """
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_code = serializers.CharField(source='branch.code', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    total_hours = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subject
        fields = [
            'id', 'branch', 'branch_name', 'branch_code', 'code', 'name', 'type', 'type_display',
            'credits', 'semester', 'year', 'theory_hours', 'practical_hours', 'tutorial_hours',
            'weekly_hours', 'minutes_per_slot',  # NEP-2020 fields
            'total_hours', 'prerequisites', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_hours', 'created_at', 'updated_at']


class TeacherSubjectSerializer(serializers.ModelSerializer):
    """
    Teacher-Subject assignment serializer
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    
    class Meta:
        model = TeacherSubject
        fields = [
            'id', 'subject', 'subject_name', 'subject_code', 'preference_level',
            'can_teach_theory', 'can_teach_practical', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TeacherSerializer(serializers.ModelSerializer):
    """
    Teacher serializer
    """
    user_details = UserSerializer(source='user', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_display = serializers.CharField(source='get_designation_display', read_only=True)
    subject_assignments = TeacherSubjectSerializer(source='teachersubject_set', many=True, read_only=True)
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'user_details', 'employee_id', 'designation', 'designation_display',
            'department', 'department_name', 'specialization', 'qualification', 'experience_years',
            'max_hours_per_day', 'max_hours_per_week', 'max_consecutive_hours',
            'availability', 'subjects_taught', 'classes_assigned',  # NEP-2020 M2M fields
            'subject_assignments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoomSerializer(serializers.ModelSerializer):
    """
    Room serializer
    """
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    is_lab = serializers.BooleanField(read_only=True)  # NEP-2020 property
    
    class Meta:
        model = Room
        fields = [
            'id', 'institution', 'institution_name', 'name', 'code', 'type', 'type_display',
            'capacity', 'has_projector', 'has_computer', 'has_whiteboard', 'has_ac',
            'building', 'floor', 'is_active', 'is_lab', 'availability', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimetableSessionSerializer(serializers.ModelSerializer):
    """
    Timetable session serializer
    """
    subject_details = SubjectSerializer(source='subject', read_only=True)
    teacher_details = TeacherSerializer(source='teacher', read_only=True)
    room_details = RoomSerializer(source='room', read_only=True)
    class_group_details = ClassGroupSerializer(source='class_group', read_only=True)
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    
    class Meta:
        model = TimetableSession
        fields = [
            'id', 'timetable', 'subject', 'subject_details', 'teacher', 'teacher_details',
            'room', 'room_details', 'class_group', 'class_group_details',
            'day_of_week', 'day_display', 'start_time', 'end_time',
            'session_type', 'session_type_display', 'notes', 'is_fixed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimetableSerializer(serializers.ModelSerializer):
    """
    Timetable serializer
    """
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    sessions = TimetableSessionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Timetable
        fields = [
            'id', 'institution', 'institution_name', 'name', 'academic_year', 'semester',
            'status', 'status_display', 'version', 'generated_by', 'generated_by_name',
            'generation_time', 'algorithm_used', 'generation_parameters',
            'total_sessions', 'conflicts_resolved', 'optimization_score',
            'sessions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'generated_by', 'generation_time', 'total_sessions',
            'conflicts_resolved', 'optimization_score', 'created_at', 'updated_at'
        ]


class TimetableListSerializer(serializers.ModelSerializer):
    """
    Simplified timetable serializer for list views
    """
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Timetable
        fields = [
            'id', 'institution', 'institution_name', 'name', 'academic_year', 'semester',
            'status', 'status_display', 'version', 'generated_by', 'generated_by_name',
            'algorithm_used', 'total_sessions', 'optimization_score', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
