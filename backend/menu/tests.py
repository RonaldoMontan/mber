from django.test import TestCase
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from .models import MenuItem
from .serializers import MenuItemSerializer


class MenuItemModelTestCase(TestCase):
    def setUp(self):
        self.valid_menu_item = MenuItem.objects.create(
            name='Feijoada',
            side_dish='Arroz, farofa, couve',
            image='https://example.com/feijoada.jpg',
            category=MenuItem.MAIN_DISH,
            lunch_box_price_small=Decimal('15.00'),
            lunch_box_price_medium=Decimal('18.00'),
            lunch_box_price_large=Decimal('22.00'),
            is_active=True
        )

    def test_create_menu_item_with_lunch_box_prices(self):
        self.assertEqual(self.valid_menu_item.name, 'Feijoada')
        self.assertEqual(self.valid_menu_item.category, MenuItem.MAIN_DISH)
        self.assertEqual(self.valid_menu_item.lunch_box_price_small, Decimal('15.00'))
        self.assertTrue(self.valid_menu_item.is_active)

    def test_create_menu_item_with_daily_plate_price(self):
        item = MenuItem.objects.create(
            name='Prato Executivo',
            side_dish='Arroz, feijão, salada',
            category=MenuItem.OTHERS,
            daily_plate_price=Decimal('25.00')
        )
        self.assertEqual(item.daily_plate_price, Decimal('25.00'))
        self.assertIsNone(item.lunch_box_price_small)

    def test_menu_item_str_method(self):
        self.assertEqual(str(self.valid_menu_item), 'Feijoada')

    def test_menu_item_ordering(self):
        MenuItem.objects.create(
            name='Bife',
            category=MenuItem.MAIN_DISH,
            daily_plate_price=Decimal('20.00')
        )
        MenuItem.objects.create(
            name='Arroz',
            category=MenuItem.OTHERS,
            daily_plate_price=Decimal('10.00')
        )
        
        items = MenuItem.objects.all()
        self.assertEqual(items[0].name, 'Arroz')
        self.assertEqual(items[1].name, 'Bife')
        self.assertEqual(items[2].name, 'Feijoada')

    def test_menu_item_validation_no_prices(self):
        item = MenuItem(
            name='Invalid Item',
            category=MenuItem.MAIN_DISH
        )
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_menu_item_default_values(self):
        item = MenuItem.objects.create(
            name='Simple Item',
            daily_plate_price=Decimal('10.00')
        )
        self.assertEqual(item.category, MenuItem.MAIN_DISH)
        self.assertTrue(item.is_active)
        self.assertEqual(item.side_dish, '')
        self.assertEqual(item.image, '')
        self.assertEqual(item.weekdays, [])
    
    def test_menu_item_with_weekdays(self):
        item = MenuItem.objects.create(
            name='Feijoada Especial',
            category=MenuItem.MAIN_DISH,
            daily_plate_price=Decimal('30.00'),
            weekdays=['wednesday', 'saturday']
        )
        self.assertEqual(item.weekdays, ['wednesday', 'saturday'])
    
    def test_menu_item_is_available_on_weekday(self):
        item = MenuItem.objects.create(
            name='Feijoada',
            category=MenuItem.MAIN_DISH,
            daily_plate_price=Decimal('25.00'),
            weekdays=['wednesday']
        )
        self.assertTrue(item.is_available_on_weekday('wednesday'))
        self.assertFalse(item.is_available_on_weekday('monday'))
    
    def test_menu_item_available_every_day_when_no_weekdays(self):
        item = MenuItem.objects.create(
            name='Arroz',
            category=MenuItem.OTHERS,
            daily_plate_price=Decimal('5.00')
        )
        self.assertTrue(item.is_available_on_weekday('monday'))
        self.assertTrue(item.is_available_on_weekday('sunday'))
    
    def test_menu_item_validation_invalid_weekday(self):
        item = MenuItem(
            name='Invalid Weekday Item',
            category=MenuItem.MAIN_DISH,
            daily_plate_price=Decimal('10.00'),
            weekdays=['invalid_day']
        )
        with self.assertRaises(ValidationError):
            item.full_clean()


class MenuItemSerializerTestCase(TestCase):
    def setUp(self):
        self.valid_data = {
            'name': 'Lasanha',
            'side_dish': 'Salada',
            'image': 'https://example.com/lasanha.jpg',
            'category': MenuItem.MAIN_DISH,
            'lunch_box_price_small': '12.00',
            'lunch_box_price_medium': '15.00',
            'lunch_box_price_large': '18.00',
            'is_active': True
        }

    def test_serializer_with_valid_data(self):
        serializer = MenuItemSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        item = serializer.save()
        self.assertEqual(item.name, 'Lasanha')
        self.assertEqual(item.lunch_box_price_small, Decimal('12.00'))

    def test_serializer_with_daily_plate_price_only(self):
        data = {
            'name': 'Prato do Dia',
            'category': MenuItem.OTHERS,
            'daily_plate_price': '20.00',
            'is_active': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_validation_no_prices(self):
        data = {
            'name': 'Invalid Item',
            'category': MenuItem.MAIN_DISH,
            'is_active': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_serializer_read_only_fields(self):
        serializer = MenuItemSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        item = serializer.save()
        
        serializer_data = MenuItemSerializer(item).data
        self.assertIn('id', serializer_data)
        self.assertIn('created_at', serializer_data)
        self.assertIn('updated_at', serializer_data)
    
    def test_serializer_with_weekdays(self):
        data = {
            'name': 'Feijoada',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '25.00',
            'weekdays': ['wednesday', 'saturday'],
            'is_active': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        item = serializer.save()
        self.assertEqual(item.weekdays, ['wednesday', 'saturday'])
    
    def test_serializer_with_invalid_weekday(self):
        data = {
            'name': 'Invalid Item',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '20.00',
            'weekdays': ['invalid_day'],
            'is_active': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('weekdays', serializer.errors)
    
    def test_serializer_with_empty_weekdays(self):
        data = {
            'name': 'Every Day Item',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '15.00',
            'weekdays': [],
            'is_active': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        item = serializer.save()
        self.assertEqual(item.weekdays, [])


class MenuItemViewSetTestCase(APITestCase):
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
        
        self.editor_user = User.objects.create_user(
            username='editor',
            password='editor123',
            email='editor@test.com'
        )
        self.editor_user.groups.add(self.editor_group)
        
        self.viewer_user = User.objects.create_user(
            username='viewer',
            password='viewer123',
            email='viewer@test.com'
        )
        self.viewer_user.groups.add(self.viewer_group)
        
        self.menu_item1 = MenuItem.objects.create(
            name='Feijoada',
            side_dish='Arroz, farofa, couve',
            category=MenuItem.MAIN_DISH,
            lunch_box_price_small=Decimal('15.00'),
            lunch_box_price_medium=Decimal('18.00'),
            lunch_box_price_large=Decimal('22.00'),
            is_active=True
        )
        
        self.menu_item2 = MenuItem.objects.create(
            name='Salada',
            side_dish='Alface, tomate',
            category=MenuItem.OTHERS,
            daily_plate_price=Decimal('10.00'),
            is_active=False
        )

    def test_list_menu_items_as_viewer(self):
        self.client.force_authenticate(user=self.viewer_user)
        response = self.client.get('/api/menu/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_menu_items_as_editor(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/menu/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        # A API filtra por weekdays, então o número varia conforme o dia da semana
        # Verificamos apenas que retorna dados
        self.assertGreaterEqual(len(data), 2)

    def test_list_menu_items_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get('/api/menu/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        # A API filtra por weekdays, então o número varia conforme o dia da semana
        self.assertGreaterEqual(len(data), 2)

    def test_list_menu_items_unauthenticated(self):
        response = self.client.get('/api/menu/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filter_menu_items_by_category(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/menu/?category=main_dish')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        # Verifica que retorna apenas itens da categoria main_dish
        self.assertGreater(len(data), 0)
        for item in data:
            self.assertEqual(item['category'], 'main_dish')

    def test_filter_menu_items_by_is_active(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/menu/?is_active=true')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        # Verifica que retorna apenas itens ativos
        self.assertGreater(len(data), 0)
        for item in data:
            self.assertTrue(item['is_active'])

    def test_search_menu_items(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/menu/?search=Feijoada')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        # Verifica que retorna itens com "Feijoada" no nome
        self.assertGreater(len(data), 0)
        for item in data:
            self.assertIn('Feijoada', item['name'])

    def test_create_menu_item_as_editor(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {
            'name': 'Strogonoff',
            'side_dish': 'Arroz, batata palha',
            'category': MenuItem.MAIN_DISH,
            'lunch_box_price_small': '16.00',
            'lunch_box_price_medium': '20.00',
            'lunch_box_price_large': '24.00',
            'is_active': True
        }
        response = self.client.post('/api/menu/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Strogonoff')
        self.assertTrue(MenuItem.objects.filter(name='Strogonoff').exists())

    def test_create_menu_item_as_viewer(self):
        self.client.force_authenticate(user=self.viewer_user)
        data = {
            'name': 'Test Item',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '15.00',
            'is_active': True
        }
        response = self.client.post('/api/menu/', data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_menu_item_without_prices(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {
            'name': 'Invalid Item',
            'category': MenuItem.MAIN_DISH,
            'is_active': True
        }
        response = self.client.post('/api/menu/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_menu_item(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get(f'/api/menu/{self.menu_item1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Feijoada')

    def test_update_menu_item_as_editor(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {
            'name': 'Feijoada Completa',
            'side_dish': 'Arroz, farofa, couve, laranja',
            'category': MenuItem.MAIN_DISH,
            'lunch_box_price_small': '16.00',
            'lunch_box_price_medium': '19.00',
            'lunch_box_price_large': '23.00',
            'is_active': True
        }
        response = self.client.put(f'/api/menu/{self.menu_item1.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Feijoada Completa')
        
        self.menu_item1.refresh_from_db()
        self.assertEqual(self.menu_item1.name, 'Feijoada Completa')

    def test_partial_update_menu_item(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {'is_active': False}
        response = self.client.patch(f'/api/menu/{self.menu_item1.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])

    def test_delete_menu_item_as_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.delete(f'/api/menu/{self.menu_item1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MenuItem.objects.filter(id=self.menu_item1.id).exists())

    def test_delete_menu_item_as_editor(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.delete(f'/api/menu/{self.menu_item1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ordering_menu_items(self):
        self.client.force_authenticate(user=self.editor_user)
        response = self.client.get('/api/menu/?ordering=name')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(data[0]['name'], 'Feijoada')
        self.assertEqual(data[1]['name'], 'Salada')
    
    def test_create_menu_item_with_weekdays(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {
            'name': 'Feijoada Especial',
            'side_dish': 'Arroz, farofa, couve, laranja',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '30.00',
            'weekdays': ['wednesday', 'saturday'],
            'is_active': True
        }
        response = self.client.post('/api/menu/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['weekdays'], ['wednesday', 'saturday'])
    
    def test_create_menu_item_with_invalid_weekday(self):
        self.client.force_authenticate(user=self.editor_user)
        data = {
            'name': 'Invalid Item',
            'category': MenuItem.MAIN_DISH,
            'daily_plate_price': '20.00',
            'weekdays': ['invalid_day'],
            'is_active': True
        }
        response = self.client.post('/api/menu/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('weekdays', response.data)
