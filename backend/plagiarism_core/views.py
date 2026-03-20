from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import User, Document, SimilarityReport
from .serializers import DocumentSerializer, DetailedSimilarityReportSerializer
from .engine import process_and_analyze_document

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling assignment document uploads & listings.
    """
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny] # In production: IsAuthenticated

    def perform_create(self, serializer):
        # Tie the document to the current authenticated user making the request
        doc = serializer.save(uploaded_by=self.request.user, status='pending')
        
        # Trigger Plagiarism Engine (currently bypassed to not_implemented)
        process_and_analyze_document(doc.id)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_report(request, report_id):
    """
    Fetch a detailed similarity report for the Split View UI
    """
    report = get_object_or_404(SimilarityReport, pk=report_id)
    serializer = DetailedSimilarityReportSerializer(report)
    return Response(serializer.data)
