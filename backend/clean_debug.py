import sys, os, traceback
sys.path.append('c:\\projects\\django-playground\\Plagiarism Detection System\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from plagiarism_core.models import Submission
from plagiarism_core.engine import process_and_analyze_document

try:
    sub = Submission.objects.order_by('-id').first()
    if sub:
        process_and_analyze_document(sub.id)
except Exception as e:
    with open('error_dump.txt', 'w') as f:
        f.write(traceback.format_exc())
