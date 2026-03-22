from django.db import models
from django.contrib.auth.models import AbstractUser

class Course(models.Model):
    name = models.CharField(max_length=255, unique=True, help_text="e.g. Computer Science")
    
    def __str__(self):
        return self.name

class Program(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='programs')
    year = models.PositiveIntegerField(help_text="e.g. 1, 2, 3, 4")
    
    class Meta:
        unique_together = ('course', 'year')

    def __str__(self):
        return f"{self.course.name} - Year {self.year}"

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    id_number = models.CharField(max_length=50, unique=True, help_text="Registration Number or Staff ID")
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True, related_name='students', help_text="Only applicable for students.")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Unit(models.Model):
    name = models.CharField(max_length=255, help_text="e.g. Database Systems")
    code = models.CharField(max_length=20, unique=True, help_text="e.g. COMP101")
    lecturers = models.ManyToManyField(User, limit_choices_to={'role': 'lecturer'}, related_name='teaching_units', blank=True)
    programs = models.ManyToManyField(Program, related_name='units', blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='assignments')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'lecturer'}, related_name='created_assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.unit.code})"

class Submission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Scan'),
        ('scanned', 'Scanned'),
        ('error', 'Error'),
        ('not_implemented', 'Not Implemented'),
    )
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions', null=True, blank=True)
    file = models.FileField(upload_to='assignments/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Store the preprocessed text for faster comparative analysis
    clean_text = models.TextField(blank=True, null=True)
    # Store tokenized sentences so NLTK parsing is only executed once per document
    tokenized_sentences = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Submission by {self.uploaded_by.username} for {self.assignment.title}"

class SimilarityReport(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='report')
    overall_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Stores JSON array of match details: [{"source_doc_id": 1, "similarity": 45.2, "matched_text": "...", "source_text": "..."}]
    matches = models.JSONField(default=list, blank=True)

    @property
    def grade(self):
        if self.overall_score <= 15:
            return 'A'
        elif self.overall_score <= 40:
            return 'B'
        elif self.overall_score <= 70:
            return 'C'
        else:
            return 'D'

    def __str__(self):
        return f"Report for '{self.submission}' - Score: {self.overall_score}% Grade {self.grade}"
