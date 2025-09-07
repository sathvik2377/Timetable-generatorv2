from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')

urlpatterns = [
    # Development login endpoint
    path('dev-login/', views.DevLoginView.as_view(), name='dev-login'),
    
    # User management endpoints
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Include router URLs
    path('', include(router.urls)),
]
