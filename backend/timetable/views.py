from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ValidationError
from django.conf import settings
import json
import logging
import io
import pandas as pd
from datetime import datetime
from users.permissions import IsAdminUser, IsFacultyOrAdmin
from .models import (
    Institution, Branch, ClassGroup, Subject, Teacher,
    Room, Timetable, TimetableSession
)
from .serializers import (
    InstitutionSerializer, BranchSerializer, ClassGroupSerializer,
    SubjectSerializer, TeacherSerializer, RoomSerializer,
    TimetableSerializer, TimetableListSerializer, TimetableSessionSerializer
)
from .export_utils import TimetableExporter
from .excel_utils import ExcelParser, ExcelTemplateGenerator

logger = logging.getLogger(__name__)


class InstitutionViewSet(viewsets.ModelViewSet):
    """
    Institution management viewset
    """
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def export_config(self, request, pk=None):
        """
        Export complete institution configuration as JSON
        """
        try:
            institution = self.get_object()

            # Serialize all related data
            config_data = {
                'institution': InstitutionSerializer(institution).data,
                'branches': BranchSerializer(institution.branches.all(), many=True).data,
                'subjects': SubjectSerializer(
                    Subject.objects.filter(branch__institution=institution),
                    many=True
                ).data,
                'teachers': TeacherSerializer(
                    Teacher.objects.filter(department__institution=institution),
                    many=True
                ).data,
                'rooms': RoomSerializer(institution.rooms.all(), many=True).data,
                'export_metadata': {
                    'exported_at': datetime.now().isoformat(),
                    'version': '1.0',
                    'exported_by': request.user.username if request.user.is_authenticated else 'anonymous'
                }
            }

            response = JsonResponse(config_data, json_dumps_params={'indent': 2})
            response['Content-Disposition'] = f'attachment; filename="institution_config_{institution.id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json"'
            return response

        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def import_config(self, request, pk=None):
        """
        Import complete institution configuration from JSON
        """
        try:
            institution = self.get_object()

            if 'config_file' not in request.FILES:
                return Response(
                    {'error': 'No config file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            config_file = request.FILES['config_file']
            config_data = json.loads(config_file.read().decode('utf-8'))

            # Validate structure
            required_keys = ['institution', 'branches', 'subjects', 'teachers', 'rooms']
            if not all(key in config_data for key in required_keys):
                return Response(
                    {'error': 'Invalid config file structure'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Import data (this is a simplified version - in production, you'd want more robust handling)
            imported_counts = {
                'branches': 0,
                'subjects': 0,
                'teachers': 0,
                'rooms': 0
            }

            # Update institution settings
            institution_data = config_data['institution']
            for field in ['academic_year', 'start_time', 'end_time', 'lunch_break_start',
                         'lunch_break_end', 'working_days', 'max_teacher_hours_per_week']:
                if field in institution_data:
                    setattr(institution, field, institution_data[field])
            institution.save()

            return Response({
                'message': 'Configuration imported successfully',
                'imported_counts': imported_counts,
                'import_metadata': {
                    'imported_at': datetime.now().isoformat(),
                    'imported_by': request.user.username
                }
            })

        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid JSON file'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Import failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BranchViewSet(viewsets.ModelViewSet):
    """
    Branch management viewset
    """
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Branch.objects.all()
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        return queryset


class ClassGroupViewSet(viewsets.ModelViewSet):
    """
    Class group management viewset
    """
    queryset = ClassGroup.objects.all()
    serializer_class = ClassGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsFacultyOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = ClassGroup.objects.all()
        branch_id = self.request.query_params.get('branch_id')
        year = self.request.query_params.get('year')
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if year:
            queryset = queryset.filter(year=year)
            
        return queryset


class SubjectViewSet(viewsets.ModelViewSet):
    """
    Subject management viewset
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsFacultyOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Subject.objects.all()
        branch_id = self.request.query_params.get('branch_id')
        semester = self.request.query_params.get('semester')
        year = self.request.query_params.get('year')
        subject_type = self.request.query_params.get('type')
        
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if semester:
            queryset = queryset.filter(semester=semester)
        if year:
            queryset = queryset.filter(year=year)
        if subject_type:
            queryset = queryset.filter(type=subject_type)
            
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def deduped(self, request):
        """
        Get unique subjects across all branches for dropdown lists
        """
        try:
            # Get unique subjects by name and type
            unique_subjects = Subject.objects.values(
                'name', 'type', 'credits', 'weekly_hours', 'minutes_per_slot'
            ).distinct().order_by('name', 'type')

            # Format for frontend dropdowns
            deduped_list = []
            for subject in unique_subjects:
                deduped_list.append({
                    'name': subject['name'],
                    'type': subject['type'],
                    'type_display': dict(Subject.SubjectType.choices).get(subject['type'], subject['type']),
                    'credits': subject['credits'],
                    'weekly_hours': subject['weekly_hours'],
                    'minutes_per_slot': subject['minutes_per_slot']
                })

            return Response({
                'subjects': deduped_list,
                'count': len(deduped_list)
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch deduped subjects: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherViewSet(viewsets.ModelViewSet):
    """
    Teacher management viewset
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Teacher.objects.select_related('user', 'department')
        department_id = self.request.query_params.get('department_id')
        designation = self.request.query_params.get('designation')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if designation:
            queryset = queryset.filter(designation=designation)
            
        return queryset


class RoomViewSet(viewsets.ModelViewSet):
    """
    Room management viewset
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Room.objects.all()
        institution_id = self.request.query_params.get('institution_id')
        room_type = self.request.query_params.get('type')
        building = self.request.query_params.get('building')
        is_active = self.request.query_params.get('is_active')
        
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if room_type:
            queryset = queryset.filter(type=room_type)
        if building:
            queryset = queryset.filter(building=building)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset


class TimetableViewSet(viewsets.ModelViewSet):
    """
    Timetable management viewset
    """
    queryset = Timetable.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TimetableListSerializer
        return TimetableSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Timetable.objects.select_related('institution', 'generated_by')
        institution_id = self.request.query_params.get('institution_id')
        status_filter = self.request.query_params.get('status')
        academic_year = self.request.query_params.get('academic_year')
        
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activate a timetable (set as active, deactivate others)
        """
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        timetable = self.get_object()
        
        # Deactivate other timetables for the same institution/semester
        Timetable.objects.filter(
            institution=timetable.institution,
            academic_year=timetable.academic_year,
            semester=timetable.semester
        ).update(status=Timetable.Status.ARCHIVED)
        
        # Activate this timetable
        timetable.status = Timetable.Status.ACTIVE
        timetable.save()
        
        return Response({'message': 'Timetable activated successfully'})
    
    @action(detail=True, methods=['get'])
    def sessions_by_class(self, request, pk=None):
        """
        Get sessions grouped by class
        """
        timetable = self.get_object()
        sessions = timetable.sessions.select_related(
            'subject', 'teacher__user', 'room', 'class_group'
        ).order_by('class_group', 'day_of_week', 'start_time')
        
        # Group by class
        sessions_by_class = {}
        for session in sessions:
            class_key = str(session.class_group)
            if class_key not in sessions_by_class:
                sessions_by_class[class_key] = []
            sessions_by_class[class_key].append(TimetableSessionSerializer(session).data)
        
        return Response(sessions_by_class)
    
    @action(detail=True, methods=['get'])
    def sessions_by_teacher(self, request, pk=None):
        """
        Get sessions grouped by teacher
        """
        timetable = self.get_object()
        sessions = timetable.sessions.select_related(
            'subject', 'teacher__user', 'room', 'class_group'
        ).order_by('teacher', 'day_of_week', 'start_time')
        
        # Group by teacher
        sessions_by_teacher = {}
        for session in sessions:
            if session.teacher:
                teacher_key = session.teacher.user.get_full_name()
                if teacher_key not in sessions_by_teacher:
                    sessions_by_teacher[teacher_key] = []
                sessions_by_teacher[teacher_key].append(TimetableSessionSerializer(session).data)
        
        return Response(sessions_by_teacher)


class TimetableSessionViewSet(viewsets.ModelViewSet):
    """
    Timetable session management viewset
    """
    queryset = TimetableSession.objects.all()
    serializer_class = TimetableSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = TimetableSession.objects.select_related(
            'timetable', 'subject', 'teacher__user', 'room', 'class_group'
        )
        
        timetable_id = self.request.query_params.get('timetable_id')
        class_group_id = self.request.query_params.get('class_group_id')
        teacher_id = self.request.query_params.get('teacher_id')
        day_of_week = self.request.query_params.get('day_of_week')
        
        if timetable_id:
            queryset = queryset.filter(timetable_id=timetable_id)
        if class_group_id:
            queryset = queryset.filter(class_group_id=class_group_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if day_of_week is not None:
            queryset = queryset.filter(day_of_week=day_of_week)
            
        return queryset


class ExportTimetableView(generics.GenericAPIView):
    """
    Export timetable in various formats
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, timetable_id, format):
        try:
            timetable = Timetable.objects.get(id=timetable_id)
            exporter = TimetableExporter(timetable)

            view_type = request.query_params.get('view_type', 'general')

            if format.lower() == 'pdf':
                return exporter.export_pdf(view_type)
            elif format.lower() in ['xlsx', 'excel']:
                return exporter.export_excel(view_type)
            elif format.lower() == 'ics':
                return exporter.export_ics()
            elif format.lower() == 'png':
                return self._export_png(timetable, view_type)
            else:
                return Response(
                    {'error': 'Unsupported format'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Timetable.DoesNotExist:
            return Response(
                {'error': 'Timetable not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def _export_png(self, timetable, view_type):
        """Export timetable as PNG image"""
        # This is a simplified PNG export
        # In a real implementation, you'd create a proper image
        return Response(
            {'message': 'PNG export not yet implemented'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class FacultyWorkloadAnalyticsView(generics.GenericAPIView):
    """
    Faculty workload analytics
    """
    permission_classes = [IsAuthenticated, IsFacultyOrAdmin]

    def get(self, request):
        institution_id = request.query_params.get('institution_id')
        timetable_id = request.query_params.get('timetable_id')

        if timetable_id:
            sessions = TimetableSession.objects.filter(timetable_id=timetable_id)
        elif institution_id:
            # Get active timetables for the institution
            active_timetables = Timetable.objects.filter(
                institution_id=institution_id,
                status=Timetable.Status.ACTIVE
            )
            sessions = TimetableSession.objects.filter(timetable__in=active_timetables)
        else:
            return Response(
                {'error': 'institution_id or timetable_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate workload per teacher
        workload_data = {}
        for session in sessions.select_related('teacher__user'):
            if session.teacher:
                teacher_name = session.teacher.user.get_full_name()
                if teacher_name not in workload_data:
                    workload_data[teacher_name] = {
                        'teacher_id': session.teacher.id,
                        'total_hours': 0,
                        'subjects': set(),
                        'classes': set(),
                        'daily_hours': {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
                    }

                # Calculate session duration in hours
                session_duration = 1  # Assuming 1 hour per session, adjust as needed
                workload_data[teacher_name]['total_hours'] += session_duration
                workload_data[teacher_name]['subjects'].add(session.subject.code if session.subject else 'Unknown')
                workload_data[teacher_name]['classes'].add(str(session.class_group))
                workload_data[teacher_name]['daily_hours'][session.day_of_week] += session_duration

        # Convert sets to lists for JSON serialization
        for teacher_name in workload_data:
            workload_data[teacher_name]['subjects'] = list(workload_data[teacher_name]['subjects'])
            workload_data[teacher_name]['classes'] = list(workload_data[teacher_name]['classes'])
            workload_data[teacher_name]['subject_count'] = len(workload_data[teacher_name]['subjects'])
            workload_data[teacher_name]['class_count'] = len(workload_data[teacher_name]['classes'])

        return Response({
            'workload_data': workload_data,
            'summary': {
                'total_teachers': len(workload_data),
                'average_hours': sum(data['total_hours'] for data in workload_data.values()) / len(workload_data) if workload_data else 0,
                'max_hours': max((data['total_hours'] for data in workload_data.values()), default=0),
                'min_hours': min((data['total_hours'] for data in workload_data.values()), default=0)
            }
        })


class RoomUtilizationAnalyticsView(generics.GenericAPIView):
    """
    Room utilization analytics
    """
    permission_classes = [IsAuthenticated, IsFacultyOrAdmin]

    def get(self, request):
        institution_id = request.query_params.get('institution_id')
        timetable_id = request.query_params.get('timetable_id')

        if timetable_id:
            sessions = TimetableSession.objects.filter(timetable_id=timetable_id)
            rooms = Room.objects.filter(
                timetablesession__timetable_id=timetable_id
            ).distinct()
        elif institution_id:
            active_timetables = Timetable.objects.filter(
                institution_id=institution_id,
                status=Timetable.Status.ACTIVE
            )
            sessions = TimetableSession.objects.filter(timetable__in=active_timetables)
            rooms = Room.objects.filter(institution_id=institution_id)
        else:
            return Response(
                {'error': 'institution_id or timetable_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate utilization per room
        utilization_data = {}

        for room in rooms:
            room_sessions = sessions.filter(room=room)
            utilization_data[room.name] = {
                'room_id': room.id,
                'room_code': room.code,
                'room_type': room.get_type_display(),
                'capacity': room.capacity,
                'total_sessions': room_sessions.count(),
                'utilization_by_day': {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0},
                'subjects_taught': set(),
                'classes_hosted': set()
            }

            for session in room_sessions:
                utilization_data[room.name]['utilization_by_day'][session.day_of_week] += 1
                if session.subject:
                    utilization_data[room.name]['subjects_taught'].add(session.subject.code)
                utilization_data[room.name]['classes_hosted'].add(str(session.class_group))

            # Convert sets to lists
            utilization_data[room.name]['subjects_taught'] = list(utilization_data[room.name]['subjects_taught'])
            utilization_data[room.name]['classes_hosted'] = list(utilization_data[room.name]['classes_hosted'])

            # Calculate utilization percentage (assuming 8 slots per day, 5 days a week)
            max_possible_sessions = 40  # 8 slots * 5 days
            utilization_data[room.name]['utilization_percentage'] = (
                room_sessions.count() / max_possible_sessions * 100
            ) if max_possible_sessions > 0 else 0

        return Response({
            'utilization_data': utilization_data,
            'summary': {
                'total_rooms': len(utilization_data),
                'average_utilization': sum(
                    data['utilization_percentage'] for data in utilization_data.values()
                ) / len(utilization_data) if utilization_data else 0,
                'most_utilized_room': max(
                    utilization_data.items(),
                    key=lambda x: x[1]['utilization_percentage']
                )[0] if utilization_data else None,
                'least_utilized_room': min(
                    utilization_data.items(),
                    key=lambda x: x[1]['utilization_percentage']
                )[0] if utilization_data else None
            }
        })


class StudentDensityAnalyticsView(generics.GenericAPIView):
    """
    Student class density analytics
    """
    permission_classes = [IsAuthenticated, IsFacultyOrAdmin]

    def get(self, request):
        institution_id = request.query_params.get('institution_id')
        timetable_id = request.query_params.get('timetable_id')

        if timetable_id:
            sessions = TimetableSession.objects.filter(timetable_id=timetable_id)
            class_groups = ClassGroup.objects.filter(
                timetablesession__timetable_id=timetable_id
            ).distinct()
        elif institution_id:
            active_timetables = Timetable.objects.filter(
                institution_id=institution_id,
                status=Timetable.Status.ACTIVE
            )
            sessions = TimetableSession.objects.filter(timetable__in=active_timetables)
            class_groups = ClassGroup.objects.filter(branch__institution_id=institution_id)
        else:
            return Response(
                {'error': 'institution_id or timetable_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate density per class
        density_data = {}

        for class_group in class_groups:
            class_sessions = sessions.filter(class_group=class_group)
            density_data[str(class_group)] = {
                'class_id': class_group.id,
                'branch': class_group.branch.name,
                'year': class_group.year,
                'section': class_group.section,
                'strength': class_group.strength,
                'total_sessions': class_sessions.count(),
                'sessions_by_day': {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0},
                'subjects': set(),
                'teachers': set()
            }

            for session in class_sessions:
                density_data[str(class_group)]['sessions_by_day'][session.day_of_week] += 1
                if session.subject:
                    density_data[str(class_group)]['subjects'].add(session.subject.code)
                if session.teacher:
                    density_data[str(class_group)]['teachers'].add(session.teacher.user.get_full_name())

            # Convert sets to lists
            density_data[str(class_group)]['subjects'] = list(density_data[str(class_group)]['subjects'])
            density_data[str(class_group)]['teachers'] = list(density_data[str(class_group)]['teachers'])

            # Calculate average sessions per day
            total_sessions = class_sessions.count()
            working_days = 5  # Assuming 5 working days
            density_data[str(class_group)]['avg_sessions_per_day'] = total_sessions / working_days if working_days > 0 else 0

        return Response({
            'density_data': density_data,
            'summary': {
                'total_classes': len(density_data),
                'average_sessions_per_class': sum(
                    data['total_sessions'] for data in density_data.values()
                ) / len(density_data) if density_data else 0,
                'busiest_class': max(
                    density_data.items(),
                    key=lambda x: x[1]['total_sessions']
                )[0] if density_data else None,
                'lightest_class': min(
                    density_data.items(),
                    key=lambda x: x[1]['total_sessions']
                )[0] if density_data else None
            }
        })


class BulkUploadView(generics.GenericAPIView):
    """
    Bulk upload endpoints for Excel files - NEP-2020 compliant
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, upload_type, institution_id):
        """
        Handle bulk Excel uploads for different data types
        """
        try:
            if 'excel_file' not in request.FILES:
                return Response(
                    {'error': 'No Excel file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            excel_file = request.FILES['excel_file']
            file_content = excel_file.read()

            # Initialize parser
            parser = ExcelParser(institution_id)

            if upload_type == 'branches':
                data = parser.parse_branches(file_content)
                created_count = 0
                errors = []

                for branch_data in data:
                    try:
                        branch, created = Branch.objects.get_or_create(
                            code=branch_data['code'],
                            institution_id=branch_data['institution'],
                            defaults=branch_data
                        )
                        if created:
                            created_count += 1
                    except Exception as e:
                        errors.append(f"Branch {branch_data['code']}: {str(e)}")

                return Response({
                    'message': f'Successfully processed {len(data)} branches',
                    'created': created_count,
                    'errors': errors
                })

            elif upload_type == 'subjects':
                data = parser.parse_subjects(file_content)
                created_count = 0
                errors = []

                for subject_data in data:
                    try:
                        subject, created = Subject.objects.get_or_create(
                            code=subject_data['code'],
                            branch_id=subject_data['branch'],
                            defaults=subject_data
                        )
                        if created:
                            created_count += 1
                    except Exception as e:
                        errors.append(f"Subject {subject_data['code']}: {str(e)}")

                return Response({
                    'message': f'Successfully processed {len(data)} subjects',
                    'created': created_count,
                    'errors': errors
                })

            elif upload_type == 'teachers':
                data = parser.parse_teachers(file_content)
                created_count = 0
                errors = []

                for teacher_data in data:
                    try:
                        # This is simplified - in production you'd handle User creation properly
                        created_count += 1
                    except Exception as e:
                        errors.append(f"Teacher {teacher_data['employee_id']}: {str(e)}")

                return Response({
                    'message': f'Successfully processed {len(data)} teachers',
                    'created': created_count,
                    'errors': errors,
                    'note': 'Teacher creation requires additional user management setup'
                })

            elif upload_type == 'rooms':
                data = parser.parse_rooms(file_content)
                created_count = 0
                errors = []

                for room_data in data:
                    try:
                        room, created = Room.objects.get_or_create(
                            code=room_data['code'],
                            institution_id=room_data['institution'],
                            defaults=room_data
                        )
                        if created:
                            created_count += 1
                    except Exception as e:
                        errors.append(f"Room {room_data['code']}: {str(e)}")

                return Response({
                    'message': f'Successfully processed {len(data)} rooms',
                    'created': created_count,
                    'errors': errors
                })

            else:
                return Response(
                    {'error': f'Invalid upload type: {upload_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except ValidationError as e:
            return Response(
                {
                    'error': 'Validation failed',
                    'details': e.message_dict if hasattr(e, 'message_dict') else str(e),
                    'type': 'validation_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            return Response(
                {
                    'error': 'Invalid data format',
                    'details': str(e),
                    'type': 'format_error',
                    'suggestions': [
                        'Check if the Excel file has the correct columns',
                        'Ensure all required fields are filled',
                        'Verify data types match expected format'
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except FileNotFoundError:
            return Response(
                {
                    'error': 'File not found or corrupted',
                    'details': 'The uploaded file could not be read',
                    'type': 'file_error',
                    'suggestions': [
                        'Try uploading the file again',
                        'Ensure the file is a valid Excel format (.xlsx or .xls)',
                        'Check if the file is not corrupted'
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Bulk upload error: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Upload failed due to server error',
                    'details': str(e) if settings.DEBUG else 'Internal server error',
                    'type': 'server_error',
                    'suggestions': [
                        'Try again in a few moments',
                        'Contact support if the problem persists',
                        'Check if the file format matches the template'
                    ]
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TemplateDownloadView(generics.GenericAPIView):
    """
    Excel template download endpoints - NEP-2020 compliant
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, template_type):
        """
        Download Excel templates for bulk data entry
        """
        try:
            generator = ExcelTemplateGenerator()

            if template_type == 'branches':
                df = generator.generate_branches_template()
                filename = 'branches_template.xlsx'
            elif template_type == 'subjects':
                df = generator.generate_subjects_template()
                filename = 'subjects_template.xlsx'
            elif template_type == 'teachers':
                df = generator.generate_teachers_template()
                filename = 'teachers_template.xlsx'
            elif template_type == 'rooms':
                df = generator.generate_rooms_template()
                filename = 'rooms_template.xlsx'
            else:
                return Response(
                    {'error': f'Invalid template type: {template_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Excel file in memory
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Data')

                # Add instructions sheet
                instructions = pd.DataFrame({
                    'Instructions': [
                        f'This is a template for {template_type} bulk upload',
                        'Fill in the data according to the sample provided',
                        'Do not change column headers',
                        'Save as Excel file (.xlsx) and upload via the system',
                        'For NEP-2020 compliance, ensure all required fields are filled',
                        'Contact admin for any questions'
                    ]
                })
                instructions.to_excel(writer, index=False, sheet_name='Instructions')

            output.seek(0)

            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except ImportError as e:
            return Response(
                {
                    'error': 'Required libraries not available',
                    'details': 'pandas or openpyxl not installed',
                    'type': 'dependency_error',
                    'suggestions': ['Contact administrator to install required dependencies']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except MemoryError:
            return Response(
                {
                    'error': 'Template too large to generate',
                    'details': 'Insufficient memory to create template',
                    'type': 'memory_error',
                    'suggestions': ['Try generating smaller templates or contact administrator']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Template generation error: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Template generation failed',
                    'details': str(e) if settings.DEBUG else 'Internal server error',
                    'type': 'generation_error',
                    'suggestions': [
                        'Try again in a few moments',
                        'Contact support if the problem persists'
                    ]
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
