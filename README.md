# Plagiarism Detection System

A web-based platform that allows students to upload assignments for similarity checking, and lecturers to review detailed similarity reports with a split-screen view.

## 🚀 Progress So Far (What we have done)

### Backend (Django & Django REST Framework)
- Set up a Django backend API configured with a **PostgreSQL** database (`plagiarism_db`).
- Implemented token-based JWT authentication (`simplejwt`).
- Implemented role-based `User` models (`student`, `lecturer`, `admin`) with an `id_number`.
- Created robust API endpoints:
  - `POST /api/auth/login/` - Authenticates user and returns JWT access/refresh tokens.
  - `GET /api/documents/` - Fetches uploaded documents.
  - `POST /api/documents/` - Uploads a new assignment document.
  - `GET /api/report/<id>/` - Fetches detailed data for a specific similarity report.
- Setup file extraction and text preprocessing scripts (`text_extraction.py`, `nlp_utils.py`, `nlp_engine.py`).
- Integrated a setup script `setup_users.py` to seed dummy users for testing.
- *Note:* The NLP Engine currently acts as a stub in `engine.py`, which marks documents as "not_implemented", bypassing the heavy ML algorithms temporarily for UI/UX testing.

### Frontend (React & Vite)
- Created a modern, fast React frontend using Vite.
- Implemented robust routing with `react-router-dom`:
  - **Login Page (`/`)**: Role-based redirection upon successful JWT verification.
  - **Student Dashboard (`/student`)**: Interface for uploading assignments and tracking statuses.
  - **Lecturer Dashboard (`/lecturer`)**: Interface for viewing all submissions and their scores.
  - **Report View (`/report/:id`)**: Split-screen view displaying a side-by-side comparison of scanned documents.
- Integrated the frontend with the backend using Axios, utilizing `jwt-decode` for session and role management based on token persistence.
- Built a beautiful UI utilizing `lucide-react` icons.

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine before running the application:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

---

## 🏃 How to Run the Application

Follow these steps carefully to run both the API and the user interface simultaneously.

### 1. Database Setup (PostgreSQL)

Before running the backend, ensure your PostgreSQL database is ready.

1. **Install PostgreSQL** on your system if you haven't already.
2. Open your preferred database client (e.g., `psql` or pgAdmin).
3. **Create the database** for the project:
   ```sql
   CREATE DATABASE plagiarism_db;
   ```
4. **Create the user** and grant privileges:
   ```sql
   CREATE USER postgres WITH PASSWORD 'root';
   GRANT ALL PRIVILEGES ON DATABASE plagiarism_db TO postgres;
   ```
   *(Note: The `backend/core/settings.py` expects the username `postgres` and password `root`. Update those settings if your local credentials differ.)*

### 2. Backend Setup

1. Open your terminal and navigate to the project root.
2. Navigate into the backend directory:
   ```bash
   cd backend
   ```
3. Set up a Python virtual environment to contain dependencies:
   ```bash
   python -m venv env
   ```
4. Activate the virtual environment:
   - **Windows:** `.\env\Scripts\activate`
   - **Mac/Linux:** `source env/bin/activate`
5. Install the required dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers scikit-learn psycopg2 python-docx PyPDF2 nltk
   ```
   *(Note: To download required NLTK data manually, you can open a python shell and run `import nltk; nltk.download('punkt'); nltk.download('stopwords')`)*
6. Apply database migrations to build tables:
   ```bash
   python manage.py migrate
   ```
7. *(Optional)* Run the setup scripts to get dummy users and an admin account:
   ```bash
   python setup_users.py
   python setup_admin.py
   ```
   *This outputs `student1` (`student123`), `lecturer1` (`lecturer123`), and an admin (`admin123`).*
8. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   *The API will be available at `http://localhost:8000`*

### 3. Frontend Setup

1. Open a **new terminal tab/window** and navigate back to the main project folder.
2. Navigate into the frontend package:
   ```bash
   cd frontend
   ```
3. Install the Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React app will be accessible at `http://localhost:5173`. Open this URL in your browser.*

---

## 🤝 Collaboration Guide

For collaborators jumping onto this project, here are some guidelines:
- **Branching:** Please branch out from `main` using descriptive names (e.g., `git checkout -b feature/nlp-engine` or `bugfix/login-ui`).
- **Backend Packages:** When adding an external library to Python, ensure it gets compiled into `requirements.txt` (once established).
- **Authentication:** All backend endpoints (except Auth and public stubs) should eventually require a valid JWT `Authorization: Bearer <token>` header. Front-end handles this securely inside its Axios setup.
- **Future Work:** The most significant next step for the team is fully hooking up `process_and_analyze_document` inside `backend/plagiarism_core/engine.py`. Most of the ML models and text extraction implementations exist in `nlp_engine.py` but need to be tied into the main Document workflow natively.
