# Chapter 5 System Details & Answers

Here are the detailed, technical answers based directly on the current implementation of the Plagiarism Detection System codebase to help you improve Chapter 5 of your documentation.

### 1. 🔐 Authentication & Security
*   **Django default authentication OR JWT tokens?** 
    We use **JWT (JSON Web Tokens)** for authentication. This is implemented via the `rest_framework_simplejwt` package.
*   **Are passwords hashed automatically by Django?** 
    **Yes**. The system uses a custom User model extending Django's `AbstractUser`, which automatically handles secure password hashing behind the scenes.
*   **Any role-based access control?** 
    **Yes**. The custom `User` model includes a specific `role` field with three choices: `student`, `lecturer`, and `admin`. This is used to restrict access (e.g., only lecturers and admins can delete or review certain submissions).

### 2. 📡 API Design
*   **Did you use Django REST Framework (DRF)?** 
    **Yes**, the backend API is entirely built on Django REST Framework using modern `ViewSet` and `Router` patterns.
*   **Example endpoints:**
    *   `/api/auth/login/` (Used to obtain the JWT access and refresh tokens)
    *   `/api/assignments/` (GET list of assignments, POST to create one)
    *   `/api/submissions/` (POST a new assignment file, GET existing submissions)
    *   `/api/report/<id>/` (GET detailed similarity report for a specific submission)
*   **Is file upload handled via API?** 
    **Yes**. File uploads are handled securely via the `/api/submissions/` endpoint which accepts `multipart/form-data` payload containing the file.

### 3. 📄 File Handling
*   **Where are uploaded assignments stored?** 
    They are stored on the **local file system** of the server (managed dynamically by Django's `MEDIA_ROOT`), specifically inside an `assignments/` subdirectory.
*   **What formats are supported?** 
    The system currently supports **`.pdf`**, **`.docx`**, and **`.txt`** file formats.
*   **Did you extract text from files? If yes, what library?** 
    **Yes**, the backend fully parses documents to extract raw text:
    *   `PyPDF2` is used for unpacking PDF files.
    *   `python-docx` is used to read and process Word documents.
    *   Standard utf-8 filesystem tools are used for `.txt` files.

### 4. 🧠 Plagiarism Detection Logic
*   **Confirm algorithms used:** 
    **TF-IDF** (Term Frequency-Inverse Document Frequency) and **Cosine Similarity** are both implemented and actively used.
*   **Did you use scikit-learn?** 
    **Yes**. The heavy mathematical lifting (vectorization and cosine similarity matrix calculation) is powered directly by `scikit-learn`. The `NLTK` library is also used for tokenizing sentences and stripping "stop words" (like *and, the, is*) to improve accuracy.
*   **Do you compare with database OR internet sources?** 
    The comparison happens entirely against the **local database**. Specifically, when an assignment is uploaded, it is compared against all *other submissions within that exact same assignment grouping* to identify peer-to-peer copying.

### 5. ⚙️ Background Processing
*   **Is plagiarism checked instantly or after submission? Any async processing?** 
    It is processed **asynchronously** after submission. Since NLP operations and matrix calculations are extremely CPU-heavy, the system relies on `django-q` (a Redis/database-backed task queue) to offload the scanning process to background workers. The frontend receives an immediate "pending scan" status, which changes to "scanned" once the background worker finishes the similarity report.

### 6. 🗄️ Database Details
*   **Are files stored in DB or file system?** 
    The physical files are stored in the **file system**. The PostgreSQL database only saves a reference or filepath to where the file lives.
*   **Any JSON fields used for similarity matches?** 
    **Yes**. PostgreSQL's native `JSONField` is utilized heavily in two places:
    1.  The `Submission` model caches tokenized sentences inside a JSON structure.
    2.  The `SimilarityReport` model has a `matches` field that stores an elaborate JSON array representing every overlapping text block, source document ID, and sentence-level similarity scores.

### 7. 📊 Grading Logic
*   **Can you define ranges?** 
    The exact mapping implemented in the `SimilarityReport` model is:
    *   **0.0% – 15.0%** → Grade **A**
    *   **15.1% – 40.0%** → Grade **B**
    *   **40.1% – 70.0%** → Grade **C**
    *   **70.1% – 100.0%** → Grade **D**

### 8. 🧪 Testing
*   **Did you actually test?** 
    **Yes**, manual interactive testing was required to develop these moving parts. We validated JWT exchange for logins, multipart file transfers for submissions, and validated the generation and grading logic of the algorithmic similarity reports. (Note: No heavy automated unit-tests via `tests.py` are present, just functional manual testing).

### 9. 🚀 Deployment / Running the System
*   **Is your system running locally only or deployed somewhere?** 
    The application runs entirely **locally** in a decoupled development environment:
    *   **Frontend (React):** Runs on `http://localhost:3000` (likely via Vite or Create React App dev server).
    *   **Backend API (Django):** Runs on `http://localhost:8000`.
    *   **Database:** Communicates with a local PostgreSQL server on `127.0.0.1:5432`.

### 10. 🔗 Integration Details
*   **How does React call Django? Axios or Fetch API?** 
    The frontend relies exclusively on **Axios** to communicate with Django. An `axios.create` instance is configured in `src/api.js` with an interceptor that automatically attaches the `Authorization: Bearer <token>` header to all outgoing requests.
