from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import ModelForm, CharField, PasswordInput, ValidationError, ModelChoiceField, ModelMultipleChoiceField
from .models import User, Submission, SimilarityReport, Course, Program, Unit, Assignment

class CustomUserAddForm(ModelForm):
    username = CharField(max_length=150, required=False, help_text='Required for Admin')
    password = CharField(widget=PasswordInput(), required=False, help_text='Required for Admin')
    confirm_password = CharField(widget=PasswordInput(), required=False, help_text='Required for Admin')
    
    course = ModelChoiceField(queryset=Course.objects.all(), required=False, help_text="Filter program choices")
    teaching_units = ModelMultipleChoiceField(queryset=Unit.objects.all(), required=False, help_text="Select units for Lecturer")

    class Meta:
        model = User
        fields = ('role', 'username', 'password', 'confirm_password', 'first_name', 'last_name', 'email', 'id_number', 'course', 'program', 'teaching_units')

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')

        if role == 'student':
            for field in ['first_name', 'last_name', 'email', 'id_number', 'program']:
                if not cleaned_data.get(field):
                    self.add_error(field, f'This field is required for a {role.capitalize()}.')
        elif role == 'lecturer':
            for field in ['first_name', 'last_name', 'email', 'id_number']:
                if not cleaned_data.get(field):
                    self.add_error(field, f'This field is required for a {role.capitalize()}.')
            if not cleaned_data.get('teaching_units'):
                self.add_error('teaching_units', 'Lecturer must have at least one teaching unit.')
        elif role == 'admin':
            if not cleaned_data.get('username'):
                self.add_error('username', 'Username is required for Admin.')
            password = cleaned_data.get('password')
            confirm_password = cleaned_data.get('confirm_password')
            if not password or not confirm_password:
                if not password: self.add_error('password', 'Password is required for Admin.')
                if not confirm_password: self.add_error('confirm_password', 'Confirm Password is required for Admin.')
            elif password != confirm_password:
                self.add_error('confirm_password', 'Passwords do not match.')

        return cleaned_data
        
    def save(self, commit=True):
        user = super().save(commit=False)
        role = self.cleaned_data.get('role')

        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            if self.cleaned_data.get('password'):
                user.set_password(self.cleaned_data.get('password'))
                
        if commit:
            user.save()
            self.save_m2m()  # ensures teaching_units is saved natively
        return user

class CustomUserAdmin(UserAdmin):
    model = User
    add_form = CustomUserAddForm

    class Media:
        js = ('admin/js/user_role_toggle.js',)

    fieldsets = UserAdmin.fieldsets + (
        ('Extra Details', {'fields': ('role', 'id_number', 'program', 'teaching_units')}),
    )
    add_fieldsets = (
        ('User Details', {
            'classes': ('wide',),
            'fields': ('role', 'username', 'password', 'confirm_password', 'first_name', 'last_name', 'email', 'id_number', 'course', 'program', 'teaching_units'),
        }),
    )
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'id_number', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email', 'id_number']

class ProgramAdmin(admin.ModelAdmin):
    filter_horizontal = ('units',)
    
class CustomUserAdminOverride(CustomUserAdmin):
    filter_horizontal = ('teaching_units',)

admin.site.register(User, CustomUserAdminOverride)
admin.site.register(Course)
admin.site.register(Program, ProgramAdmin)
admin.site.register(Unit)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(SimilarityReport)
