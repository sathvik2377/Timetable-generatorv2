from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.GenerateTimetableView.as_view(), name='generate-timetable'),
    path('generate-demo/', views.GenerateDemoTimetableView.as_view(), name='generate-demo-timetable'),
    path('generate-variants/', views.GenerateMultipleVariantsView.as_view(), name='generate-multiple-variants'),
    path('commit-variant/', views.CommitTimetableVariantView.as_view(), name='commit-timetable-variant'),
    path('validate/', views.ValidateTimetableView.as_view(), name='validate-timetable'),
    path('constraints/', views.ConstraintListView.as_view(), name='constraint-list'),
]
