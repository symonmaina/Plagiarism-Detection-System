import docx
import PyPDF2
import io

def extract_text_from_file(file_obj):
    """
    Extracts text from a Django uploaded file object.
    Supports .txt, .docx, and .pdf formats.
    """
    filename = file_obj.name.lower()
    text = ""
    
    try:
        # Move file pointer to the beginning
        file_obj.seek(0)
        
        if filename.endswith('.txt'):
            text = file_obj.read().decode('utf-8', errors='ignore')
        elif filename.endswith('.docx'):
            # Convert InMemoryUploadedFile to a stream python-docx can read
            doc = docx.Document(file_obj)
            text = "\n".join([para.text for para in doc.paragraphs])
        elif filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(file_obj)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        
    return text
