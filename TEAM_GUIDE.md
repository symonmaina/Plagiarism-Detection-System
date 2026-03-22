# Complete Team Guide: New Plagiarism System Architecture

This guide provides a comprehensive overview of how to understand, set up, and use the newly overhauled Plagiarism Detection System. It covers the new hierarchical data models, database migration steps, and the updated workflows for both Students and Lecturers.

---

## 1. Local Setup Instructions

Since the database schema has changed drastically, you will need to reset your local database to apply the new architecture.

### Resetting the Database
1. **Delete old database (if applicable)**: If you were using SQLite, your `db.sqlite3` file can be deleted. If you are using PostgreSQL, you may want to drop and recreate your local `plagiarism_db` database to avoid conflicting foreign-key constraints.
2. **Apply Migrations**:
   Open a terminal in the `backend/` directory, activate your virtual environment, and run:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. **Seed Administrative Users**:
   If needed, run the setup scripts to get your initial user testing accounts:
   ```bash
   python setup_users.py
   python setup_admin.py
   ```

---

## 2. Understanding the New Data Models

The old, flat `Document` upload model has been completely replaced with a robust academic hierarchy. Data flows from top to bottom as follows:

1. **Course**: The highest level grouping (e.g., *BSc Computer Science*).
2. **Program**: A specific year cohort within a course (e.g., *Computer Science - Year 3*). 
   - **Students** are assigned to a specific Program when their accounts are created.
3. **Unit**: An individual class/module (e.g., *COMP204 - Operating Systems*). 
   - Units belong to specific Programs.
   - **Lecturers** are assigned to teach specific Units.
4. **Assignment**: A specific piece of coursework created by a Lecturer under a Unit. Assignments have a Title, Description, and Deadline.
5. **Submission**: The actual document uploaded by a Student for an Assignment. This replaces the old `Document` model.
6. **SimilarityReport**: Generated off a `Submission`. It contains the `overall_score`, the matched texts, and a dynamically calculated `grade` (A, B, C, or D).

---

## 3. Workflow: Lecturer

The Lecturer workflow has expanded to support assignment creation and specific unit monitoring:

1. **Accessing Units**: Upon logging in at `/lecturer`, the Lecturer Dashboard displays all `Units` the lecturer is assigned to teach.
2. **Unit Details & Assignments**: By clicking on a Unit, the lecturer enters the `LecturerUnitDetail` view. Here, they can:
   - View enrolled students and statistics for that unit.
   - Create new **Assignments** with specific deadlines.
3. **Viewing Submissions**: Clicking into an Assignment opens the `LecturerAssignmentDetail` view. This shows a table of all student `Submissions` for that specific assignment.
4. **Analyzing Reports**: Lecturers can view the generated `SimilarityReport` for any submission to see the grade and exactly which sentences were plagiarized.

---

## 4. Workflow: Student

The Student workflow has been streamlined to ensure assignments are uploaded to the correct location:

1. **Accessing Enrolled Units**: Upon logging in at `/student`, the dashboard displays the student's assigned `Program` and the `Units` they are currently enrolled in.
2. **Viewing Pending Assignments**: Clicking a Unit opens the `StudentUnitDetail` view, displaying a list of active `Assignments` for that class.
3. **Submitting Work**: Students upload their `.pdf` or `.docx` files directly to a specific Assignment.
4. **Reviewing Grades**: Once the NLP engine completes its scan, the student can view their similarity score and grade directly on their dashboard.

---

## 5. NLP Processing Optimizations

We have resolved major bottleneck issues with the Natural Language Processing algorithms:
- **Database Caching**: NLTK sentence tokenization and text-cleaning are computationally expensive. The system now performs this step exactly *once* during the initial upload. The cleaned text and tokenized JSON are cached directly onto the `Submission` database row.
- **Improved Accuracy**: The `engine.py` now leverages these cached sentences to perform much faster, more accurate pairwise comparisons against other submissions in the database.

---
*Happy coding! Please ensure resolving any uncommitted changes or merge conflicts carefully before pushing these updates to GitHub.*
