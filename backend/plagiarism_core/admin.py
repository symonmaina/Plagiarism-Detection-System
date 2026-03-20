from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Document, SimilarityReport

class CustomUserAdmin(UserAdmin):
    model = User
    # Add 'role' and 'id_number' to the fieldsets to be editable in the detail view
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Details', {'fields': ('role', 'id_number')}),
    )
    # Add 'role' and 'id_number' when adding a completely new user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Details', {'fields': ('role', 'id_number', 'email')}),
    )
    # What columns are shown in the user list view
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'id_number', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email', 'id_number']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Document)
admin.site.register(SimilarityReport)
