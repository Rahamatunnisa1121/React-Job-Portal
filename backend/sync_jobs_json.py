import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devprofile.settings')
django.setup()

from profileapp.models import Developer

JOBS_JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'jobs.json')

with open(JOBS_JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

for user in data.get('users', []):
    dev_id = int(user.get('id'))
    email = user.get('email')
    first_name = user.get('first_name', '')
    last_name = user.get('last_name', '')
    about = user.get('about', '')

    dev, created = Developer.objects.update_or_create(
        id=dev_id,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'about': about,
        }
    )
    print(f"{'Created' if created else 'Updated'} developer: {dev_id} - {email}")

print("Sync complete!")