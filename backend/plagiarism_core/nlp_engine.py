import os
import docx
import PyPDF2
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Ensure NLTK data is downloaded (run once)
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

def extract_text(file_path):
    """
    Extract raw text from a given file path based on its extension.
    Supports: .txt, .pdf, .docx
    """
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    text = ""
    
    try:
        if ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        elif ext == '.docx':
            doc = docx.Document(file_path)
            text = '\n'.join([para.text for para in doc.paragraphs])
        elif ext == '.pdf':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        else:
            raise ValueError(f"Unsupported file format: {ext}")
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        
    return text

def preprocess_text(text):
    """
    Cleans text by tokenizing, making lowercase, and removing stop words and non-alphanumeric chars.
    """
    if not text:
        return ""
        
    # Tokenize
    tokens = word_tokenize(text.lower())
    
    # Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    clean_tokens = [word for word in tokens if word.isalnum() and word not in stop_words]
    
    return " ".join(clean_tokens)

def calculate_similarity(new_text, new_sentences, existing_docs_dict):
    """
    Compares `new_text` against a dictionary of `existing_docs_dict` {id: {"text": "...", "sentences": [...], "title": "..."}}.
    Returns the overall max similarity percentage and a list of specific matches.
    """
    if not new_text or not existing_docs_dict:
        return 0.0, []
        
    documents = [new_text]
    doc_ids = ["new"]
    doc_titles = ["New Upload"]
    doc_sentences = [new_sentences]
    
    for doc_id, doc_data in existing_docs_dict.items():
        text = doc_data["text"]
        if text: # Ensure we don't add empty text
            documents.append(text)
            doc_ids.append(doc_id)
            doc_titles.append(doc_data.get("title", f"Document {doc_id}"))
            doc_sentences.append(doc_data["sentences"])
            
    if len(documents) <= 1:
        return 0.0, []

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Calculate Cosine Similarity against the first document (new_text)
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    matches = []
    overall_max_score = 0.0
    
    for idx, score in enumerate(cosine_sim):
        similarity_percentage = round(score * 100, 2)
        if similarity_percentage > 0:
            source_sentences = doc_sentences[idx + 1]
            
            matched_blocks = []
            
            # Sentence-level similarity
            # OPTIMIZATION: Only run deep sentence highlighting if overall doc similarity > 5%
            # This skips massive matrix math for documents that only share common English stop words.
            if new_sentences and source_sentences and similarity_percentage > 5.0:
                try:
                    sent_vectorizer = TfidfVectorizer()
                    all_sents = new_sentences + source_sentences
                    sent_matrix = sent_vectorizer.fit_transform(all_sents)
                    
                    new_sent_matrix = sent_matrix[:len(new_sentences)]
                    source_sent_matrix = sent_matrix[len(new_sentences):]
                    
                    sent_sims = cosine_similarity(new_sent_matrix, source_sent_matrix)
                    
                    for i, new_s in enumerate(new_sentences):
                        max_sim_idx = sent_sims[i].argmax()
                        max_sim_val = sent_sims[i][max_sim_idx]
                        
                        if max_sim_val > 0.6:  # Threshold for sentence match (60%)
                            matched_blocks.append({
                                "matched_text": new_s,
                                "source_text": source_sentences[max_sim_idx],
                                "score": round(max_sim_val * 100, 2)
                            })
                except ValueError:
                    pass # Empty vocabulary
                    
            match_data = {
                "source_doc_id": doc_ids[idx + 1],
                "source_doc_title": doc_titles[idx + 1],
                "similarity": similarity_percentage,
                "notes": "Document-level and block-level similarity",
                "matched_blocks": matched_blocks
            }
            matches.append(match_data)
            if similarity_percentage > overall_max_score:
                overall_max_score = similarity_percentage
                
    # Sort matches by similarity descending
    matches.sort(key=lambda x: x['similarity'], reverse=True)
            
    return overall_max_score, matches
