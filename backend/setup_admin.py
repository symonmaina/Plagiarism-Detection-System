from django.contrib.auth import get_user_model

User = get_user_model()
superusers = User.objects.filter(is_superuser=True)

if superusers.exists():
    admin_user = superusers.first()
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"USERNAME_FOUND: {admin_user.username}")
else:
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("USERNAME_FOUND: admin")
