from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    id_number = models.CharField(max_length=50, unique=True, help_text="Registration Number or Staff ID")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Document(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Scan'),
        ('scanned', 'Scanned'),
        ('error', 'Error'),
        ('not_implemented', 'Not Implemented'),
    )
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='assignments/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Store the preprocessed text for faster comparative analysis
    clean_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} by {self.uploaded_by.username}"

class SimilarityReport(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='report')
    overall_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Stores JSON array of match details: [{"source_doc_id": 1, "similarity": 45.2, "matched_text": "...", "source_text": "..."}]
    matches = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"Report for {self.document.title} - Score: {self.overall_score}%"
