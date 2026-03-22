from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
import datetime

from .models import User, Course, Program, Unit, Assignment, Submission, SimilarityReport
from .serializers import (
    UserSerializer, CourseSerializer, ProgramSerializer, UnitSerializer, 
    AssignmentSerializer, SubmissionSerializer, DetailedSimilarityReportSerializer
)
from .engine import process_and_analyze_document

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # In production: IsAdminUser

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny] # In production: IsAdminUser

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny] # In production: IsAdminUser

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [AllowAny]

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all().order_by('-created_at')
    serializer_class = AssignmentSerializer
    permission_classes = [AllowAny]

from django_q.tasks import async_task

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling assignment submission uploads & listings.
    """
    queryset = Submission.objects.all().order_by('-uploaded_at')
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Tie the submission to the current user
        # In this mock up we use the first student user if not authenticated
        # For a real implementation: `uploader = self.request.user`
        if self.request.user.is_authenticated:
            uploader = self.request.user
        else:
            uploader = User.objects.filter(role='student').first()

        sub = serializer.save(uploaded_by=uploader, status='pending')
        # Offload heavy NLP matrix operations to the background queue
        async_task('plagiarism_core.engine.process_and_analyze_document', sub.id)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_report(request, report_id):
    report = get_object_or_404(SimilarityReport, pk=report_id)
    serializer = DetailedSimilarityReportSerializer(report)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_weekly_report(request):
    seven_days_ago = timezone.now() - datetime.timedelta(days=7)
    recent_subs = Submission.objects.filter(uploaded_at__gte=seven_days_ago).select_related('uploaded_by', 'report').order_by('-uploaded_at')
    
    total_submissions = recent_subs.count()
    reports = [sub.report for sub in recent_subs if hasattr(sub, 'report')]
    
    average_score = 0
    if reports:
        total_score = sum(report.overall_score for report in reports)
        average_score = total_score / len(reports)
        
    submissions_data = []
    for sub in recent_subs:
        score = 0.0
        grade = 'N/A'
        if hasattr(sub, 'report'):
            score = sub.report.overall_score
            grade = sub.report.grade
        submissions_data.append({
            'submission_id': sub.id,
            'assignment_title': sub.assignment.title if sub.assignment else 'Instance Plagiarism Check',
            'uploaded_by': sub.uploaded_by.username,
            'uploaded_at': sub.uploaded_at,
            'status': sub.status,
            'similarity_score': score,
            'grade': grade
        })
        
    data = {
        'total_submissions': total_submissions,
        'average_similarity_score': round(average_score, 2),
        'submissions': submissions_data
    }
    return Response(data)
