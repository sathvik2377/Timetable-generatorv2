from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.http import HttpResponse
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
