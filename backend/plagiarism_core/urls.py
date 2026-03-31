from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import (
    UserViewSet, CourseViewSet, ProgramViewSet, UnitViewSet,
    AssignmentViewSet, SubmissionViewSet, get_report, get_weekly_report,
    change_password, forgot_password, get_admin_course_data
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='api-login'),
    path('auth/change-password/', change_password, name='api-change-password'),
    path('auth/forgot-password/', forgot_password, name='api-forgot-password'),
    path('report/weekly/', get_weekly_report, name='api-weekly-report'),
    path('report/<int:report_id>/', get_report, name='api-report'),
    path('admin-api/course-data/', get_admin_course_data, name='api-admin-course-data'),
]
