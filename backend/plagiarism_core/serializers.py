from rest_framework import serializers
from .models import User, Submission, SimilarityReport, Course, Program, Unit, Assignment

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    class Meta:
        model = Program
        fields = ['id', 'course', 'course_name', 'year']

class UserSerializer(serializers.ModelSerializer):
    program_details = ProgramSerializer(source='program', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'id_number', 'program', 'program_details']

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    class Meta:
        model = Assignment
        fields = '__all__'

class SimilarityReportSerializer(serializers.ModelSerializer):
    grade = serializers.ReadOnlyField()
    class Meta:
        model = SimilarityReport
        fields = ['id', 'overall_score', 'grade', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    report = SimilarityReportSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'file', 'uploaded_by', 'uploaded_at', 'status', 'report', 'clean_text']

class DetailedSimilarityReportSerializer(serializers.ModelSerializer):
    submission = SubmissionSerializer(read_only=True)
    grade = serializers.ReadOnlyField()
    submission_text = serializers.CharField(source='submission.clean_text', read_only=True)
    
    class Meta:
        model = SimilarityReport
        fields = ['id', 'submission', 'overall_score', 'grade', 'matches', 'created_at', 'submission_text']
