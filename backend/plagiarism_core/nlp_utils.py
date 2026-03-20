import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re

def preprocess_text(text):
    if not text:
        return ""
        
    # Lowercase
    text = text.lower()
    
    # Remove non-alphanumeric characters
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words]
    
    return ' '.join(filtered_tokens)
