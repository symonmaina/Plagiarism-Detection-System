from rest_framework import serializers
from .models import User, Document, SimilarityReport

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'id_number']

class SimilarityReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimilarityReport
        fields = ['id', 'overall_score', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    report = SimilarityReportSerializer(read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'uploaded_by', 'uploaded_at', 'status', 'report']

class DetailedSimilarityReportSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = SimilarityReport
        fields = ['id', 'document', 'overall_score', 'matches', 'created_at']
