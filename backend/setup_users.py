from django.contrib.auth import get_user_model
import json

User = get_user_model()

# Setup Student
student, created_student = User.objects.get_or_create(
    username='student1',
    defaults={'role': 'student', 'id_number': 'S12345'}
)
student.set_password('student123')
student.save()

# Setup Lecturer
lecturer, created_lecturer = User.objects.get_or_create(
    username='lecturer1',
    defaults={'role': 'lecturer', 'id_number': 'L12345'}
)
lecturer.set_password('lecturer123')
lecturer.save()

print(json.dumps({
    "student": {
        "username": student.username,
        "password": "student123",
        "role": student.role,
        "id_number": student.id_number
    },
    "lecturer": {
        "username": lecturer.username,
        "password": "lecturer123",
        "role": lecturer.role,
        "id_number": lecturer.id_number
    }
}))
