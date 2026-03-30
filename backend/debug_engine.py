import sys
import traceback
sys.path.append('c:\\projects\\django-playground\\Plagiarism Detection System\\backend')

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from plagiarism_core.models import Submission, DocumentMatch, MatchBlock
from plagiarism_core.text_extraction import extract_text_from_file
from plagiarism_core.nlp_engine import extract_text, preprocess_text, calculate_similarity

sub = Submission.objects.order_by('-id').first()
if not sub:
    print("No submissions to debug.")
    sys.exit()

print(f"Debugging submission {sub.id}")
try:
    # 1. Extract text
    raw_text = extract_text_from_file(sub.file)
    from nltk.tokenize import sent_tokenize
    new_sentences = sent_tokenize(raw_text)
    new_sentences = [s for s in new_sentences if len(s.split()) >= 3]
    print(f"Extracted {len(new_sentences)} sentences.")
    
    # 2. Fetch existing submissions
    existing_subs = Submission.objects.filter(assignment=sub.assignment).exclude(id=sub.id).exclude(status__in=['error', 'withdrawn'])
    print(f"Found {existing_subs.count()} existing submissions to compare against.")
    
    existing_subs_dict = {}
    for s in existing_subs:
        if s.clean_text:
            existing_subs_dict[str(s.id)] = {
                "text": s.clean_text,
                "sentences": s.tokenized_sentences,
                "title": s.file.name.split('/')[-1] if s.file else f"Submission {s.id}"
            }
            
    # 3. Calculate similarity
    print("Calculating similarity...")
    overall_score, matches = calculate_similarity(raw_text, new_sentences, existing_subs_dict)
    print(f"Overall Match Score: {overall_score}, Match array length: {len(matches)}")
    
    # 4. Save
    print("Populating DB models...")
    for match_dict in matches:
        # We won't actually hit DB here, just print to see if keys are missing
        print(f"Source Doc ID: {match_dict.get('source_doc_id')}, Title: {match_dict.get('source_doc_title')}")
        for block in match_dict.get('matched_blocks', []):
            pass # Just iterate
            
    print("Debug script completed successfully without DB commit.")
    
except Exception as e:
    print("\n--- ERROR DETAILS ---")
    traceback.print_exc()

