from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import json

User = get_user_model()


class Institution(models.Model):
    """
    Institution/College/School information
    """
    
    class InstitutionType(models.TextChoices):
        SCHOOL = 'school', _('School Level')
        COLLEGE = 'college', _('College Level')
        UNIVERSITY = 'university', _('University Level')
    
    name = models.CharField(max_length=200)
    type = models.CharField(
        max_length=20,
        choices=InstitutionType.choices,
        default=InstitutionType.COLLEGE
    )
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Academic settings
    academic_year = models.CharField(max_length=20, default='2024-25')
    start_time = models.TimeField(default='09:00:00')
    end_time = models.TimeField(default='17:00:00')
    slot_duration = models.IntegerField(default=60, help_text='Duration in minutes')
    lunch_break_start = models.TimeField(default='13:00:00')
    lunch_break_end = models.TimeField(default='14:00:00')
    
    # Working days
    working_days = models.JSONField(
        default=list,
        help_text='List of working days (0=Monday, 6=Sunday)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Institution')
        verbose_name_plural = _('Institutions')
    
    def __str__(self):
        return self.name


class Branch(models.Model):
    """
    Academic branches/departments
    """
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Branch head
    head = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='headed_branches'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Branch')
        verbose_name_plural = _('Branches')
        unique_together = ['institution', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ClassGroup(models.Model):
    """
    Class groups (e.g., CSE-2025-A, MBA-2025)
    """
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='class_groups')
    name = models.CharField(max_length=50)
    year = models.IntegerField()
    section = models.CharField(max_length=5, default='A')
    semester = models.IntegerField(default=1)
    
    # Capacity
    strength = models.IntegerField(default=60)
    
    # Class teacher/coordinator
    coordinator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coordinated_classes'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Class Group')
        verbose_name_plural = _('Class Groups')
        unique_together = ['branch', 'year', 'section']
    
    def __str__(self):
        return f"{self.branch.code}-{self.year}-{self.section}"


class Subject(models.Model):
    """
    Academic subjects/courses
    """
    
    class SubjectType(models.TextChoices):
        CORE = 'core', _('Core Subject')
        ELECTIVE = 'elective', _('Elective Subject')
        LAB = 'lab', _('Laboratory')
        SKILL = 'skill', _('Skill Development')
        PROJECT = 'project', _('Project Work')
    
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='subjects')
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    type = models.CharField(
        max_length=20,
        choices=SubjectType.choices,
        default=SubjectType.CORE
    )
    
    # Academic details
    credits = models.IntegerField(default=3)
    semester = models.IntegerField(default=1)
    year = models.IntegerField(default=1)
    
    # Teaching details
    theory_hours = models.IntegerField(default=3, help_text='Theory hours per week')
    practical_hours = models.IntegerField(default=0, help_text='Practical hours per week')
    tutorial_hours = models.IntegerField(default=0, help_text='Tutorial hours per week')
    
    # Prerequisites
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Subject')
        verbose_name_plural = _('Subjects')
        unique_together = ['branch', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def total_hours(self):
        return self.theory_hours + self.practical_hours + self.tutorial_hours


class Teacher(models.Model):
    """
    Teacher/Faculty information
    """
    
    class Designation(models.TextChoices):
        PROFESSOR = 'professor', _('Professor')
        ASSOCIATE_PROFESSOR = 'associate_professor', _('Associate Professor')
        ASSISTANT_PROFESSOR = 'assistant_professor', _('Assistant Professor')
        LECTURER = 'lecturer', _('Lecturer')
        VISITING_FACULTY = 'visiting_faculty', _('Visiting Faculty')
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    designation = models.CharField(
        max_length=30,
        choices=Designation.choices,
        default=Designation.ASSISTANT_PROFESSOR
    )
    
    # Academic details
    department = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='teachers')
    specialization = models.CharField(max_length=200, blank=True, null=True)
    qualification = models.CharField(max_length=200, blank=True, null=True)
    experience_years = models.IntegerField(default=0)
    
    # Teaching constraints
    max_hours_per_day = models.IntegerField(default=6)
    max_hours_per_week = models.IntegerField(default=24)
    max_consecutive_hours = models.IntegerField(default=3)
    
    # Availability (JSON field storing day-wise time slots)
    availability = models.JSONField(
        default=dict,
        help_text='Day-wise availability slots'
    )
    
    # Subjects taught
    subjects = models.ManyToManyField(Subject, through='TeacherSubject', related_name='teachers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Teacher')
        verbose_name_plural = _('Teachers')
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


class TeacherSubject(models.Model):
    """
    Teacher-Subject assignment with preferences
    """
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    # Preference level (1-5, 5 being highest preference)
    preference_level = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Can teach theory/practical
    can_teach_theory = models.BooleanField(default=True)
    can_teach_practical = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['teacher', 'subject']
        verbose_name = _('Teacher Subject Assignment')
        verbose_name_plural = _('Teacher Subject Assignments')
    
    def __str__(self):
        return f"{self.teacher} - {self.subject}"


class Room(models.Model):
    """
    Classroom/Laboratory information
    """

    class RoomType(models.TextChoices):
        CLASSROOM = 'classroom', _('Classroom')
        LABORATORY = 'laboratory', _('Laboratory')
        SEMINAR_HALL = 'seminar_hall', _('Seminar Hall')
        AUDITORIUM = 'auditorium', _('Auditorium')
        LIBRARY = 'library', _('Library')

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, unique=True)
    type = models.CharField(
        max_length=20,
        choices=RoomType.choices,
        default=RoomType.CLASSROOM
    )

    # Capacity and facilities
    capacity = models.IntegerField(default=60)
    has_projector = models.BooleanField(default=False)
    has_computer = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=True)
    has_ac = models.BooleanField(default=False)

    # Location
    building = models.CharField(max_length=50, blank=True, null=True)
    floor = models.IntegerField(default=1)

    # Availability
    is_active = models.BooleanField(default=True)
    availability = models.JSONField(
        default=dict,
        help_text='Day-wise availability slots'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')
        unique_together = ['institution', 'code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Timetable(models.Model):
    """
    Generated timetable instances
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        ACTIVE = 'active', _('Active')
        ARCHIVED = 'archived', _('Archived')

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='timetables')
    name = models.CharField(max_length=200)
    academic_year = models.CharField(max_length=20)
    semester = models.IntegerField(default=1)

    # Status and versioning
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    version = models.IntegerField(default=1)

    # Generation metadata
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_timetables')
    generation_time = models.DurationField(null=True, blank=True)
    algorithm_used = models.CharField(max_length=50, default='OR-Tools CP-SAT')

    # Constraints and parameters used
    generation_parameters = models.JSONField(
        default=dict,
        help_text='Parameters used during generation'
    )

    # Statistics
    total_sessions = models.IntegerField(default=0)
    conflicts_resolved = models.IntegerField(default=0)
    optimization_score = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Timetable')
        verbose_name_plural = _('Timetables')
        unique_together = ['institution', 'academic_year', 'semester', 'version']

    def __str__(self):
        return f"{self.name} - {self.academic_year} (v{self.version})"


class TimetableSession(models.Model):
    """
    Individual timetable sessions/slots
    """

    class SessionType(models.TextChoices):
        THEORY = 'theory', _('Theory Class')
        PRACTICAL = 'practical', _('Practical/Lab')
        TUTORIAL = 'tutorial', _('Tutorial')
        BREAK = 'break', _('Break')
        LUNCH = 'lunch', _('Lunch Break')

    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name='sessions')

    # Session details
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)

    # Time slot
    day_of_week = models.IntegerField(help_text='0=Monday, 6=Sunday')
    start_time = models.TimeField()
    end_time = models.TimeField()

    # Session type and metadata
    session_type = models.CharField(
        max_length=20,
        choices=SessionType.choices,
        default=SessionType.THEORY
    )

    # Additional information
    notes = models.TextField(blank=True, null=True)
    is_fixed = models.BooleanField(default=False, help_text='Cannot be moved during editing')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Timetable Session')
        verbose_name_plural = _('Timetable Sessions')
        unique_together = ['timetable', 'day_of_week', 'start_time', 'class_group']

    def __str__(self):
        if self.subject:
            return f"{self.class_group} - {self.subject.code} ({self.get_day_display()})"
        return f"{self.class_group} - {self.session_type} ({self.get_day_display()})"

    def get_day_display(self):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[self.day_of_week]


class TimetableConstraint(models.Model):
    """
    Custom constraints for timetable generation
    """

    class ConstraintType(models.TextChoices):
        TEACHER_AVAILABILITY = 'teacher_availability', _('Teacher Availability')
        ROOM_AVAILABILITY = 'room_availability', _('Room Availability')
        NO_CONSECUTIVE_SUBJECTS = 'no_consecutive_subjects', _('No Consecutive Same Subject')
        LUNCH_BREAK = 'lunch_break', _('Lunch Break')
        MAX_HOURS_PER_DAY = 'max_hours_per_day', _('Maximum Hours Per Day')
        PREFERRED_TIME_SLOTS = 'preferred_time_slots', _('Preferred Time Slots')

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='constraints')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=30, choices=ConstraintType.choices)

    # Constraint parameters
    parameters = models.JSONField(
        default=dict,
        help_text='Constraint-specific parameters'
    )

    # Priority (1-10, 10 being highest)
    priority = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Timetable Constraint')
        verbose_name_plural = _('Timetable Constraints')

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
