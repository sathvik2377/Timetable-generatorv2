from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Institution, Branch, ClassGroup, Subject, Teacher, TeacherSubject,
    Room, Timetable, TimetableSession, TimetableConstraint
)


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'academic_year', 'start_time', 'end_time')
    list_filter = ('type', 'academic_year')
    search_fields = ('name', 'email')
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'type', 'address', 'phone', 'email', 'website')
        }),
        (_('Academic Settings'), {
            'fields': ('academic_year', 'start_time', 'end_time', 'slot_duration', 
                      'lunch_break_start', 'lunch_break_end', 'working_days')
        }),
    )


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'institution', 'head')
    list_filter = ('institution',)
    search_fields = ('code', 'name')
    raw_id_fields = ('head',)


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'year', 'section', 'semester', 'strength')
    list_filter = ('branch', 'year', 'semester')
    search_fields = ('name',)
    raw_id_fields = ('coordinator',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'branch', 'type', 'credits', 'semester', 'total_hours')
    list_filter = ('branch', 'type', 'semester', 'year')
    search_fields = ('code', 'name')
    filter_horizontal = ('prerequisites',)


class TeacherSubjectInline(admin.TabularInline):
    model = TeacherSubject
    extra = 1


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'designation', 'department', 'experience_years')
    list_filter = ('designation', 'department')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')
    raw_id_fields = ('user',)
    inlines = [TeacherSubjectInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'employee_id', 'designation', 'department')
        }),
        (_('Academic Details'), {
            'fields': ('specialization', 'qualification', 'experience_years')
        }),
        (_('Teaching Constraints'), {
            'fields': ('max_hours_per_day', 'max_hours_per_week', 'max_consecutive_hours')
        }),
        (_('Availability'), {
            'fields': ('availability',)
        }),
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'type', 'capacity', 'building', 'floor', 'is_active')
    list_filter = ('type', 'building', 'is_active', 'has_projector', 'has_computer')
    search_fields = ('code', 'name')
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('institution', 'name', 'code', 'type')
        }),
        (_('Capacity & Facilities'), {
            'fields': ('capacity', 'has_projector', 'has_computer', 'has_whiteboard', 'has_ac')
        }),
        (_('Location'), {
            'fields': ('building', 'floor')
        }),
        (_('Availability'), {
            'fields': ('is_active', 'availability')
        }),
    )


@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('name', 'institution', 'academic_year', 'semester', 'status', 'version', 'generated_by')
    list_filter = ('institution', 'status', 'academic_year', 'semester')
    search_fields = ('name',)
    raw_id_fields = ('generated_by',)
    readonly_fields = ('total_sessions', 'conflicts_resolved', 'optimization_score', 'generation_time')
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('institution', 'name', 'academic_year', 'semester')
        }),
        (_('Status & Version'), {
            'fields': ('status', 'version')
        }),
        (_('Generation Details'), {
            'fields': ('generated_by', 'algorithm_used', 'generation_parameters')
        }),
        (_('Statistics'), {
            'fields': ('total_sessions', 'conflicts_resolved', 'optimization_score', 'generation_time')
        }),
    )


@admin.register(TimetableSession)
class TimetableSessionAdmin(admin.ModelAdmin):
    list_display = ('timetable', 'class_group', 'subject', 'teacher', 'room', 'day_of_week', 'start_time')
    list_filter = ('timetable', 'session_type', 'day_of_week', 'is_fixed')
    search_fields = ('subject__code', 'subject__name', 'teacher__user__first_name', 'teacher__user__last_name')
    raw_id_fields = ('timetable', 'subject', 'teacher', 'room', 'class_group')
    
    fieldsets = (
        (_('Session Details'), {
            'fields': ('timetable', 'subject', 'teacher', 'room', 'class_group')
        }),
        (_('Time Slot'), {
            'fields': ('day_of_week', 'start_time', 'end_time')
        }),
        (_('Session Type & Notes'), {
            'fields': ('session_type', 'notes', 'is_fixed')
        }),
    )


@admin.register(TimetableConstraint)
class TimetableConstraintAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'institution', 'priority', 'is_active')
    list_filter = ('type', 'institution', 'priority', 'is_active')
    search_fields = ('name',)
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('institution', 'name', 'type')
        }),
        (_('Constraint Details'), {
            'fields': ('parameters', 'priority', 'is_active')
        }),
    )
