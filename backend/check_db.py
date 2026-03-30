import sys, os
sys.path.append('c:\\projects\\django-playground\\Plagiarism Detection System\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from plagiarism_core.models import Submission

with open('db_dump.txt', 'w') as f:
    for s in Submission.objects.order_by('-id')[:10]:
        f.write(f"ID: {s.id}, File: {s.file}, Status: {s.status}\n")
        if hasattr(s, 'report'):
            f.write(f"  Report Score: {s.report.overall_score}, MatchBlocks: {s.report.doc_matches.count()}\n")
        else:
            f.write("  No Report\n")
