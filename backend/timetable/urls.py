from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import export_views

router = DefaultRouter()
router.register(r'institutions', views.InstitutionViewSet)
router.register(r'branches', views.BranchViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'teachers', views.TeacherViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'class-groups', views.ClassGroupViewSet)
router.register(r'timetables', views.TimetableViewSet)
router.register(r'sessions', views.TimetableSessionViewSet)

urlpatterns = [
    # Export endpoints
    path('timetables/<int:timetable_id>/export/pdf/', export_views.export_timetable_pdf, name='export-timetable-pdf'),
    path('timetables/<int:timetable_id>/export/excel/', export_views.export_timetable_excel, name='export-timetable-excel'),
    path('timetables/<int:timetable_id>/export/png/', export_views.export_timetable_png, name='export-timetable-png'),
    path('timetables/<int:timetable_id>/export/ics/', export_views.export_timetable_ics, name='export-timetable-ics'),
    
    # Analytics endpoints
    path('analytics/faculty-workload/', 
         views.FacultyWorkloadAnalyticsView.as_view(), 
         name='faculty-workload-analytics'),
    path('analytics/room-utilization/', 
         views.RoomUtilizationAnalyticsView.as_view(), 
         name='room-utilization-analytics'),
    path('analytics/student-density/',
         views.StudentDensityAnalyticsView.as_view(),
         name='student-density-analytics'),

    # NEP-2020 Bulk Upload/Download endpoints
    path('upload/excel/<str:upload_type>/<int:institution_id>/',
         views.BulkUploadView.as_view(),
         name='bulk-upload-excel'),
    path('download/template/<str:template_type>/',
         views.TemplateDownloadView.as_view(),
         name='download-template'),

    # Include router URLs
    path('', include(router.urls)),
]
