import sys
import traceback
sys.path.append('c:\\projects\\django-playground\\Plagiarism Detection System\\backend')

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from plagiarism_core.models import Submission
from plagiarism_core.engine import process_and_analyze_document

sub = Submission.objects.order_by('-id').first()
if sub:
    print(f"Testing submission ID: {sub.id}")
    try:
        process_and_analyze_document(sub.id)
        print("Success! Status is:", Submission.objects.get(id=sub.id).status)
    except Exception as e:
        print("Error:")
        traceback.print_exc()
else:
    print("No submissions found.")
