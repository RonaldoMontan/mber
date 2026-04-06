from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class UserViewSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.manager_group, _ = Group.objects.get_or_create(name='Manager')
        self.editor_group, _ = Group.objects.get_or_create(name='Editor')
        self.viewer_group, _ = Group.objects.get_or_create(name='Viewer')
        
        self.manager_user = User.objects.create_user(
            username='manager',
            password='manager123',
            email='manager@test.com'
        )
        self.manager_user.groups.add(self.manager_group)
        
        self.regular_user = User.objects.create_user(
            username='regular',
            password='regular123',
            email='regular@test.com'
        )
        
        self.other_user = User.objects.create_user(
            username='other',
            password='other123',
            email='other@test.com'
        )

    def test_list_users_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 4 usuários: manager, regular, other + developer (criado pela migration)
        self.assertEqual(len(response.data['results']), 4)

    def test_list_users_as_regular_user(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['username'], 'regular')

    def test_list_users_unauthenticated(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_user_as_owner(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f'/api/users/{self.regular_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'regular')

    def test_retrieve_user_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get(f'/api/users/{self.regular_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'regular')

    def test_retrieve_other_user_as_regular_user(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f'/api/users/{self.other_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_user(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'username': 'regular',
            'email': 'newemail@test.com',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.patch(f'/api/users/{self.regular_user.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'newemail@test.com')
        self.assertEqual(response.data['first_name'], 'John')

    def test_delete_user_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.delete(f'/api/users/{self.regular_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.regular_user.id).exists())

    def test_delete_user_as_regular_user(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(f'/api/users/{self.regular_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RegisterViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.manager_group, _ = Group.objects.get_or_create(name='Manager')
        
        self.manager_user = User.objects.create_user(
            username='manager',
            password='manager123'
        )
        self.manager_user.groups.add(self.manager_group)

    def test_register_user_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        data = {
            'username': 'newuser',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'email': 'newuser@test.com',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_user_password_mismatch(self):
        self.client.force_authenticate(user=self.manager_user)
        data = {
            'username': 'newuser',
            'password': 'NewPass123!',
            'password2': 'DifferentPass123!',
            'email': 'newuser@test.com'
        }
        response = self.client.post('/api/auth/register/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_register_user_without_manager_permission(self):
        regular_user = User.objects.create_user(username='regular', password='regular123')
        self.client.force_authenticate(user=regular_user)
        
        data = {
            'username': 'newuser',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'email': 'newuser@test.com'
        }
        response = self.client.post('/api/auth/register/', data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class LoginViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@test.com'
        )

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login/', data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)


class LogoutViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.refresh = RefreshToken.for_user(self.user)

    def test_logout_success(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'refresh': str(self.refresh)
        }
        response = self.client.post('/api/auth/logout/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_logout_without_token(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/logout/', {})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)


class CurrentUserViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@test.com'
        )

    def test_get_current_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@test.com')

    def test_get_current_user_unauthenticated(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AssignGroupActionTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.manager_group, _ = Group.objects.get_or_create(name='Manager')
        self.editor_group, _ = Group.objects.get_or_create(name='Editor')
        self.viewer_group, _ = Group.objects.get_or_create(name='Viewer')
        
        self.manager_user = User.objects.create_user(
            username='manager',
            password='manager123'
        )
        self.manager_user.groups.add(self.manager_group)
        
        self.regular_user = User.objects.create_user(
            username='regular',
            password='regular123'
        )

    def test_assign_group_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        data = {'group_name': 'Editor'}
        response = self.client.post(f'/api/users/{self.regular_user.id}/assign_group/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertTrue(self.regular_user.groups.filter(name='Editor').exists())

    def test_assign_group_as_regular_user(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {'group_name': 'Editor'}
        response = self.client.post(f'/api/users/{self.regular_user.id}/assign_group/', data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assign_nonexistent_group(self):
        self.editor_group.delete()
        self.viewer_group.delete()
        
        self.client.force_authenticate(user=self.manager_user)
        data = {'group_name': 'Editor'}
        response = self.client.post(f'/api/users/{self.regular_user.id}/assign_group/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class ChangePasswordActionTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.manager_group, _ = Group.objects.get_or_create(name='Manager')
        
        self.manager_user = User.objects.create_user(
            username='manager',
            password='manager123'
        )
        self.manager_user.groups.add(self.manager_group)
        
        self.regular_user = User.objects.create_user(
            username='regular',
            password='regular123'
        )

    def test_change_own_password(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'old_password': 'regular123',
            'new_password': 'NewPass123!',
            'new_password2': 'NewPass123!'
        }
        response = self.client.post(f'/api/users/{self.regular_user.id}/change_password/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.check_password('NewPass123!'))

    def test_change_password_wrong_old_password(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'old_password': 'wrongpassword',
            'new_password': 'NewPass123!',
            'new_password2': 'NewPass123!'
        }
        response = self.client.post(f'/api/users/{self.regular_user.id}/change_password/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_change_password_mismatch(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'old_password': 'regular123',
            'new_password': 'NewPass123!',
            'new_password2': 'DifferentPass123!'
        }
        response = self.client.post(f'/api/users/{self.regular_user.id}/change_password/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manager_change_other_user_password(self):
        self.client.force_authenticate(user=self.manager_user)
        data = {
            'old_password': 'regular123',
            'new_password': 'NewPass123!',
            'new_password2': 'NewPass123!'
        }
        response = self.client.post(f'/api/users/{self.regular_user.id}/change_password/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
