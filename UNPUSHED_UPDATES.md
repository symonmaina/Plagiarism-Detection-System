# Unpushed Local Advancements 🚀

This document summarizes the recent features, architectural changes, and improvements that have been developed locally but **have not yet been pushed to GitHub**. 

Please review these changes below so you know what to expect once this branch is merged into `main`.

---

## 🏗 Backend Architecture Updates

### 1. Hierarchical Data Models
We have completely overhauled the flat `Document` upload system. The database now supports a realistic academic hierarchy:
- **`Course` & `Program`**: Users (Students) now belong to a specific `Program` under a `Course` (e.g., *Computer Science - Year 3*).
- **`Unit`**: Represents a specific class (e.g., *COMP101 - Database Systems*). Units map to specific Lecturers and Programs.
- **`Assignment`**: Lecturers create assignments under specific Units, complete with deadlines.
- **`Submission`**: Replaces the old `Document` model. Submissions are now tied to a specific `Assignment` and `User`.

### 2. Upgraded NLP Engine & Processing
- The stubbed NLP engine has been **implemented**. 
- The system now tokenizes sentences and cleans text on upload.
- To drastically improve performance during similarity checks, `clean_text` and `tokenized_sentences` are now cached directly on the `Submission` database object. NLTK parsing only happens once per document!

### 3. Automated Grading Logic
- The `SimilarityReport` model now includes a dynamically calculated `grade` property based on the `overall_score`:
  - **A**: <= 15% similarity
  - **B**: <= 40% similarity
  - **C**: <= 70% similarity
  - **D**: > 70% similarity

---

## 🖥 Frontend Enhancements

### 1. Protected Routing & Security
- Implemented a `ProtectedRoute` wrapper component in `App.jsx`.
- Routes are now strictly guarded based on user roles (`student`, `lecturer`, `admin`) to prevent unauthorized access to dashboards or reports.

### 2. New Dashboard Views
Added several new nested views to fully support the new database hierarchy:
- **`LecturerUnitDetail` / `StudentUnitDetail`**: Allows users to view specific information and assignments for a single Unit.
- **`LecturerAssignmentDetail`**: Allows lecturers to view all student submissions for a specific assignment.
- **`UnitReportView`**: A broader dashboard summarizing plagiarism reports across an entire unit.

### 3. Dashboard Refactoring
- Both `StudentDashboard.jsx` and `LecturerDashboard.jsx` were heavily refactored to query and display data based on `Units` and `Assignments`, replacing the old flat list of document uploads.

---
*Note: Make sure to run `python manage.py makemigrations` and `python manage.py migrate` after pulling these changes to apply the new database schema!*
