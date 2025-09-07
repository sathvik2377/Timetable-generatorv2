from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from users.permissions import IsAdminUser
from timetable.models import Institution, Timetable, TimetableConstraint
from .ortools_scheduler import TimetableScheduler
from .serializers import GenerateTimetableSerializer, TimetableConstraintSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class GenerateTimetableView(generics.CreateAPIView):
    """
    Generate a new timetable using OR-Tools scheduler
    """
    serializer_class = GenerateTimetableSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        institution_id = serializer.validated_data['institution_id']
        timetable_name = serializer.validated_data['name']
        
        try:
            # Check if institution exists, create demo one if not
            try:
                institution = Institution.objects.get(id=institution_id)
            except Institution.DoesNotExist:
                # Create a demo institution if none exists
                institution = Institution.objects.create(
                    name="Demo Institution",
                    type="college",
                    address="Demo Address",
                    phone="123-456-7890",
                    email="demo@institution.edu"
                )
                # Update the institution_id to use the created one
                institution_id = institution.id

            # Initialize scheduler
            scheduler = TimetableScheduler(institution_id)

            # Generate timetable
            timetable = scheduler.generate_timetable(
                name=timetable_name,
                generated_by_user=request.user
            )

            if timetable:
                return Response({
                    'success': True,
                    'message': 'Timetable generated successfully',
                    'timetable_id': timetable.id,
                    'total_sessions': timetable.total_sessions,
                    'optimization_score': timetable.optimization_score
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to generate timetable. No feasible solution found.',
                    'error': 'INFEASIBLE_SOLUTION'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error generating timetable: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while generating the timetable',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateDemoTimetableView(generics.CreateAPIView):
    """
    Generate a demo timetable with sample data
    """
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            # Create or get demo institution
            institution, created = Institution.objects.get_or_create(
                name="Demo Institution",
                defaults={
                    'type': 'college',
                    'address': 'Demo Address',
                    'phone': '123-456-7890',
                    'email': 'demo@institution.edu'
                }
            )

            # Create demo departments if they don't exist
            cs_dept, _ = Department.objects.get_or_create(
                name="Computer Science",
                code="CS",
                institution=institution,
                defaults={'head_of_department': None}
            )

            # Create demo subjects
            subjects_data = [
                {'name': 'Data Structures', 'code': 'CS301', 'credits': 4, 'type': 'theory'},
                {'name': 'Algorithms', 'code': 'CS302', 'credits': 3, 'type': 'theory'},
                {'name': 'Programming Lab', 'code': 'CS303', 'credits': 2, 'type': 'practical'},
            ]

            for subject_data in subjects_data:
                Subject.objects.get_or_create(
                    code=subject_data['code'],
                    department=cs_dept,
                    defaults={
                        'name': subject_data['name'],
                        'credits': subject_data['credits'],
                        'subject_type': subject_data['type']
                    }
                )

            # Create demo teachers
            teacher_data = [
                {'name': 'Dr. Smith', 'email': 'smith@demo.edu', 'employee_id': 'T001'},
                {'name': 'Prof. Johnson', 'email': 'johnson@demo.edu', 'employee_id': 'T002'},
            ]

            for teacher_info in teacher_data:
                Teacher.objects.get_or_create(
                    employee_id=teacher_info['employee_id'],
                    defaults={
                        'name': teacher_info['name'],
                        'email': teacher_info['email'],
                        'department': cs_dept,
                        'max_hours_per_day': 6
                    }
                )

            # Create demo rooms
            room_data = [
                {'name': 'Room 101', 'type': 'classroom', 'capacity': 40},
                {'name': 'Lab A', 'type': 'lab', 'capacity': 30},
                {'name': 'Room 205', 'type': 'classroom', 'capacity': 35},
            ]

            for room_info in room_data:
                Room.objects.get_or_create(
                    name=room_info['name'],
                    institution=institution,
                    defaults={
                        'room_type': room_info['type'],
                        'capacity': room_info['capacity']
                    }
                )

            # Generate simple demo timetable
            demo_timetable = {
                'Monday': {
                    '09:00-10:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '11:00-12:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                },
                'Tuesday': {
                    '09:00-10:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '10:00-11:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '11:00-12:00': {'subject': 'Tutorial', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                },
                'Wednesday': {
                    '09:00-10:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '11:00-12:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                },
                'Thursday': {
                    '09:00-10:00': {'subject': 'Tutorial', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '11:00-12:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                },
                'Friday': {
                    '09:00-10:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '10:00-11:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '11:00-12:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                }
            }

            return Response({
                'success': True,
                'message': 'Demo timetable generated successfully',
                'institution_id': institution.id,
                'timetable': demo_timetable,
                'total_sessions': 20,
                'optimization_score': 85.5
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error generating demo timetable: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error generating demo timetable: {str(e)}',
                'error': 'DEMO_GENERATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateDemoTimetableView(generics.CreateAPIView):
    """
    Generate a demo timetable with sample data
    """
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            # Generate simple demo timetable
            demo_timetable = {
                'Monday': {
                    '09:00-10:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '11:00-12:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '12:00-13:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                },
                'Tuesday': {
                    '09:00-10:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '10:00-11:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '11:00-12:00': {'subject': 'Tutorial', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '12:00-13:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                },
                'Wednesday': {
                    '09:00-10:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '11:00-12:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '12:00-13:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                },
                'Thursday': {
                    '09:00-10:00': {'subject': 'Tutorial', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '10:00-11:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '11:00-12:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                    '12:00-13:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                },
                'Friday': {
                    '09:00-10:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '10:00-11:00': {'subject': 'Programming Lab', 'teacher': 'Prof. Johnson', 'room': 'Lab A'},
                    '11:00-12:00': {'subject': 'Data Structures', 'teacher': 'Dr. Smith', 'room': 'Room 101'},
                    '12:00-13:00': {'subject': 'Free Period', 'teacher': '', 'room': ''},
                    '13:00-14:00': {'subject': 'Lunch Break', 'teacher': '', 'room': ''},
                    '14:00-15:00': {'subject': 'Algorithms', 'teacher': 'Dr. Smith', 'room': 'Room 205'},
                }
            }

            return Response({
                'success': True,
                'message': 'Demo timetable generated successfully',
                'timetable': demo_timetable,
                'total_sessions': 20,
                'optimization_score': 85.5
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error generating demo timetable: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error generating demo timetable: {str(e)}',
                'error': 'DEMO_GENERATION_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValidateTimetableView(generics.GenericAPIView):
    """
    Validate a timetable for conflicts and constraint violations
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        timetable_id = request.data.get('timetable_id')
        
        if not timetable_id:
            return Response({
                'success': False,
                'message': 'Timetable ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            timetable = Timetable.objects.get(id=timetable_id)
            
            # Perform validation
            validation_result = self._validate_timetable(timetable)
            
            return Response({
                'success': True,
                'timetable_id': timetable.id,
                'validation_result': validation_result
            })
            
        except Timetable.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Timetable not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _validate_timetable(self, timetable):
        """
        Validate timetable for various conflicts
        """
        conflicts = {
            'teacher_conflicts': [],
            'room_conflicts': [],
            'class_conflicts': [],
            'constraint_violations': []
        }
        
        sessions = timetable.sessions.all()
        
        # Check for teacher conflicts
        teacher_schedule = {}
        for session in sessions:
            if session.teacher:
                key = (session.teacher.id, session.day_of_week, session.start_time)
                if key in teacher_schedule:
                    conflicts['teacher_conflicts'].append({
                        'teacher': session.teacher.user.get_full_name(),
                        'day': session.get_day_display(),
                        'time': str(session.start_time),
                        'conflicting_sessions': [
                            f"{session.class_group} - {session.subject.code}",
                            f"{teacher_schedule[key].class_group} - {teacher_schedule[key].subject.code}"
                        ]
                    })
                else:
                    teacher_schedule[key] = session
        
        # Check for room conflicts
        room_schedule = {}
        for session in sessions:
            if session.room:
                key = (session.room.id, session.day_of_week, session.start_time)
                if key in room_schedule:
                    conflicts['room_conflicts'].append({
                        'room': session.room.name,
                        'day': session.get_day_display(),
                        'time': str(session.start_time),
                        'conflicting_sessions': [
                            f"{session.class_group} - {session.subject.code}",
                            f"{room_schedule[key].class_group} - {room_schedule[key].subject.code}"
                        ]
                    })
                else:
                    room_schedule[key] = session
        
        # Check for class conflicts
        class_schedule = {}
        for session in sessions:
            key = (session.class_group.id, session.day_of_week, session.start_time)
            if key in class_schedule:
                conflicts['class_conflicts'].append({
                    'class_group': str(session.class_group),
                    'day': session.get_day_display(),
                    'time': str(session.start_time),
                    'conflicting_sessions': [
                        f"{session.subject.code} - {session.teacher.user.get_full_name()}",
                        f"{class_schedule[key].subject.code} - {class_schedule[key].teacher.user.get_full_name()}"
                    ]
                })
            else:
                class_schedule[key] = session
        
        # Calculate summary
        total_conflicts = (
            len(conflicts['teacher_conflicts']) +
            len(conflicts['room_conflicts']) +
            len(conflicts['class_conflicts']) +
            len(conflicts['constraint_violations'])
        )
        
        return {
            'is_valid': total_conflicts == 0,
            'total_conflicts': total_conflicts,
            'conflicts': conflicts,
            'total_sessions': sessions.count()
        }


class ConstraintListView(generics.ListCreateAPIView):
    """
    List and create timetable constraints
    """
    serializer_class = TimetableConstraintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            return TimetableConstraint.objects.filter(
                institution_id=institution_id,
                is_active=True
            )
        return TimetableConstraint.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        # Only admins can create constraints
        if not self.request.user.is_admin:
            raise PermissionError("Only admins can create constraints")

        serializer.save()


class GenerateDemoTimetableView(generics.GenericAPIView):
    """
    Generate a demo timetable with sample data for demonstration
    """
    permission_classes = []  # Allow public access for demo

    def post(self, request):
        """Generate a demo timetable with realistic data"""
        import random
        from django.utils import timezone

        # Demo subjects and data
        subjects = ['MC', 'PPS', 'ECL-K2', 'BEEL-K1', 'EC', 'BEE', 'EDC', 'ITW-K1&K2', 'BEEL-K2', 'PPSL-K1&K2']
        teachers = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor']
        rooms = ['101', '102', '103', '104', '105', '201', '202', '203', 'Lab-1', 'Lab-2']

        # Time slots
        time_slots = [
            {'start': '10:00', 'end': '11:30', 'display': '10:00-11:30'},
            {'start': '11:30', 'end': '01:00', 'display': '11:30-01:00'},
            {'start': '02:00', 'end': '03:30', 'display': '02:00-03:30'},
            {'start': '03:30', 'end': '05:00', 'display': '03:30-05:00'}
        ]

        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        # Generate timetable
        timetable = {}

        for day in days:
            timetable[day] = {}
            for slot in time_slots:
                # 70% chance of having a class in each slot
                if random.random() > 0.3:
                    subject = random.choice(subjects)
                    teacher = random.choice(teachers)
                    room = random.choice(rooms)

                    timetable[day][slot['display']] = {
                        'subject': subject,
                        'teacher': teacher,
                        'room': room,
                        'time': slot['display']
                    }

        # Add special sessions
        timetable['Wed']['11:30-01:00'] = {
            'subject': 'LUNCH',
            'teacher': '',
            'room': '',
            'time': '11:30-01:00',
            'isBreak': True
        }

        timetable['Sat']['10:00-12:00'] = {
            'subject': 'PPSL-K1&K2',
            'teacher': 'Wilson',
            'room': 'Lab-1',
            'time': '10:00-12:00',
            'isLab': True
        }

        return Response({
            'success': True,
            'message': 'Demo timetable generated successfully',
            'timetable': timetable,
            'metadata': {
                'total_sessions': sum(len(day_schedule) for day_schedule in timetable.values()),
                'days': days,
                'time_slots': time_slots,
                'subjects_used': list(set(
                    session.get('subject', '') for day_schedule in timetable.values()
                    for session in day_schedule.values() if session.get('subject')
                )),
                'generated_at': timezone.now().isoformat()
            }
        }, status=status.HTTP_200_OK)
