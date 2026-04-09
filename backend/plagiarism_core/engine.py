from plagiarism_core.models import Submission, SimilarityReport
from plagiarism_core.text_extraction import extract_text_from_file
from plagiarism_core.nlp_engine import extract_text, preprocess_text, calculate_similarity

def process_and_analyze_document(submission_id: int):
    """
    Core engine to process a submission, extract text, and compare it against existing submissions in the same assignment.
    """
    try:
        new_sub = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return None
        
    try:
        # 1. Extract text
        raw_text = extract_text_from_file(new_sub.file)
        
        # Tokenize sentences upfront
        from nltk.tokenize import sent_tokenize
        new_sentences = sent_tokenize(raw_text)
        new_sentences = [s for s in new_sentences if len(s.split()) >= 3]
        
        # Store raw_text in clean_text
        new_sub.clean_text = raw_text
        new_sub.tokenized_sentences = new_sentences
        new_sub.save(update_fields=['clean_text', 'tokenized_sentences'])
        
        # 2. Fetch existing submissions' texts for the same assignment
        # Scope strictly to the same assignment to prevent cross-module false positives,
        # and ignore any submissions that have failed or been withdrawn by students.
        existing_subs = Submission.objects.filter(
            assignment=new_sub.assignment
        ).exclude(id=submission_id).exclude(status__in=['error', 'withdrawn'])
        
        existing_subs_dict = {}
        for sub in existing_subs:
            # Reconstruct missing historical data or fetch from cache
            if not sub.tokenized_sentences and sub.clean_text:
                sub_sentences = sent_tokenize(sub.clean_text)
                sub_sentences = [s for s in sub_sentences if len(s.split()) >= 3]
                sub.tokenized_sentences = sub_sentences
                sub.save(update_fields=['tokenized_sentences'])
            elif not sub.clean_text:
                try:
                    text_extracted = extract_text_from_file(sub.file)
                    if text_extracted:
                        sub_sentences = sent_tokenize(text_extracted)
                        sub_sentences = [s for s in sub_sentences if len(s.split()) >= 3]
                        sub.clean_text = text_extracted
                        sub.tokenized_sentences = sub_sentences
                        sub.save(update_fields=['clean_text', 'tokenized_sentences'])
                except Exception as e:
                    print(f"Failed to extract older sub {sub.id}: {e}")
            
            if sub.clean_text:
                file_name = sub.file.name.split('/')[-1] if sub.file else f"Submission {sub.id}"
                existing_subs_dict[str(sub.id)] = {
                    "text": sub.clean_text,
                    "sentences": sub.tokenized_sentences,
                    "title": file_name
                }
                    
        # 3. Calculate similarity
        overall_score, matches = calculate_similarity(raw_text, new_sentences, existing_subs_dict)
        
        # 4. Save SimilarityReport
        report, created = SimilarityReport.objects.update_or_create(
            submission=new_sub,
            defaults={
                'overall_score': overall_score,
                'matches': matches
            }
        )
        
        # 5. Update Status
        new_sub.status = 'scanned'
        new_sub.save(update_fields=['status'])
        
        return report
        
    except Exception as e:
        import traceback
        import os
        from django.conf import settings
        
        crash_log_path = os.path.join(settings.BASE_DIR, 'crash_log.txt')
        with open(crash_log_path, 'w') as f:
            f.write(traceback.format_exc())
            
        print(f"Error processing submission {submission_id}: {e}")
        new_sub.status = 'error'
        new_sub.save(update_fields=['status'])
        return None
