from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin with role-based organization
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'employee_id', 'student_id')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'email', 'phone_number')
        }),
        (_('Role & IDs'), {
            'fields': ('role', 'employee_id', 'student_id')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Preferences'), {
            'fields': ('preferred_theme',)
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    User Profile admin
    """
    list_display = ('user', 'department', 'specialization', 'email_notifications', 'created_at')
    list_filter = ('department', 'email_notifications', 'sms_notifications', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'department', 'specialization')
    raw_id_fields = ('user',)
    
    fieldsets = (
        (_('User'), {'fields': ('user',)}),
        (_('Profile Information'), {
            'fields': ('bio', 'avatar', 'address', 'emergency_contact')
        }),
        (_('Academic Information'), {
            'fields': ('department', 'specialization')
        }),
        (_('Notification Preferences'), {
            'fields': ('email_notifications', 'sms_notifications')
        }),
    )
