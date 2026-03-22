from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Submission, SimilarityReport, Course, Program, Unit, Assignment

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Details', {'fields': ('role', 'id_number', 'program')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Details', {'fields': ('role', 'id_number', 'program', 'email')}),
    )
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'id_number', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email', 'id_number']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(Program)
admin.site.register(Unit)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(SimilarityReport)
