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

def calculate_similarity(new_text, existing_docs_dict):
    """
    Compares `new_text` against a dictionary of `existing_docs_dict` {id: text}.
    Returns the overall max similarity percentage and a list of specific matches.
    """
    if not new_text or not existing_docs_dict:
        return 0.0, []
        
    documents = [new_text]
    doc_ids = ["new"]
    
    for doc_id, text in existing_docs_dict.items():
        if text: # Ensure we don't add empty text
            documents.append(text)
            doc_ids.append(doc_id)
            
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
            match_data = {
                "source_doc_id": doc_ids[idx + 1],
                "similarity": similarity_percentage,
                # For a real MVP, one would implement block-level text matching here to show exact copied paragraphs.
                # For this high-level engine, we return document-level similarity.
                "notes": "Document-level similarity"
            }
            matches.append(match_data)
            if similarity_percentage > overall_max_score:
                overall_max_score = similarity_percentage
                
    # Sort matches by similarity descending
    matches.sort(key=lambda x: x['similarity'], reverse=True)
            
    return overall_max_score, matches
