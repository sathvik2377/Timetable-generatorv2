"""
URL configuration for AI Academic Timetable Scheduler project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def api_root(request):
    """API root endpoint with system status"""
    return JsonResponse({
        'message': 'AI Academic Timetable Scheduler API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'users': '/api/users/',
            'timetable': '/api/timetable/',
            'scheduler': '/api/scheduler/',
        },
        'demo_credentials': {
            'admin': {'email': 'admin@demo.local', 'password': 'Admin@1234'},
            'faculty': {'email': 'faculty1@demo.local', 'password': 'Faculty@123'},
            'student': {'email': 'student1@demo.local', 'password': 'Student@123'},
        }
    })

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api_root'),

    # Admin
    path('admin/', admin.site.urls),

    # Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/scheduler/', include('scheduler.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
