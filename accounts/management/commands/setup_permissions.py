from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Setup initial groups and permissions for the application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up groups and permissions...'))

        groups_permissions = {
            'Manager': {
                'description': 'Full access - can create, read, update, and delete',
                'permissions': ['add', 'change', 'delete', 'view']
            },
            'Editor': {
                'description': 'Can create, read, and update - cannot delete',
                'permissions': ['add', 'change', 'view']
            },
            'Viewer': {
                'description': 'Read-only access',
                'permissions': ['view']
            }
        }

        for group_name, group_data in groups_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created group: {group_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'○ Group already exists: {group_name}')
                )
            
            self.stdout.write(f'  {group_data["description"]}')

        self.stdout.write('\n' + self.style.SUCCESS('Groups setup completed!'))
        self.stdout.write('\nNext steps:')
        self.stdout.write('1. Create a superuser: python manage.py createsuperuser')
        self.stdout.write('2. Run migrations: python manage.py migrate')
        self.stdout.write('3. Access admin at: http://localhost:8000/admin')
        self.stdout.write('\nTo assign users to groups:')
        self.stdout.write('- Use Django Admin interface, or')
        self.stdout.write('- Use API: POST /api/users/{id}/assign_group/ with {"group_name": "Manager"}')
        self.stdout.write('\n' + self.style.SUCCESS('Setup complete!'))
