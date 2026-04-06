---
name: generate-code
description: Padrões e diretrizes para desenvolvimento de código no projeto Mber API
---

# Skill: Geração de Código - Projeto Mber

## Princípios Gerais

### 1. Simplicidade e Clareza
- Prefira soluções simples e diretas
- Evite over-engineering
- CRUD deve ser realmente CRUD - sem complexidade desnecessária
- Código deve ser autoexplicativo

### 2. Estrutura de Projeto Django
```
projeto/
├── config/          # Configurações do projeto
├── app_name/        # Apps Django
│   ├── migrations/  # Migrações de banco
│   ├── tests.py     # Testes unitários
│   ├── views.py     # Views/ViewSets
│   ├── serializers.py
│   ├── permissions.py
│   └── urls.py
└── requirements.txt
```

## Padrões de Código

### Django REST Framework

#### ViewSets
```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filtrar queryset baseado no usuário
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='Manager').exists():
            return User.objects.all()
        return User.objects.filter(id=user.id)
```

#### Serializers
```python
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']
```

### Migrations

#### Data Migrations
- Sempre adicionar dependências corretas
- Usar `get_or_create` para evitar duplicatas
- Incluir função de reversão

```python
from django.db import migrations
from django.contrib.auth.models import User, Group

def create_default_data(apps, schema_editor):
    manager_group, _ = Group.objects.get_or_create(name='Manager')
    # Criar dados padrão

def reverse_default_data(apps, schema_editor):
    # Reverter mudanças
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('auth', '__latest__'),  # Importante para dependências
    ]
    
    operations = [
        migrations.RunPython(create_default_data, reverse_default_data),
    ]
```

### Testes

#### Estrutura de Testes
```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

class UserViewSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Usar get_or_create para evitar conflitos com migrations
        self.manager_group, _ = Group.objects.get_or_create(name='Manager')
        
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_list_users(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

#### Regras de Testes
1. **Sempre usar `get_or_create` para grupos** - evita conflito com migrations
2. **Testar todos os casos**: sucesso, falha, permissões
3. **Usar `force_authenticate`** para autenticação em testes
4. **Considerar dados criados por migrations** ao validar contagens

### Permissões

#### Custom Permissions
```python
from rest_framework import permissions

class IsManager(permissions.BasePermission):
    """
    Permission class that only allows users in the 'Manager' group.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        return request.user.groups.filter(name='Manager').exists()
```

### URLs

#### Router Pattern
```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
```

## Convenções de Nomenclatura

### Variáveis e Funções
- **snake_case** para variáveis e funções
- **PascalCase** para classes
- Nomes descritivos e em inglês

### Grupos de Permissão
- **Manager**: Permissões completas
- **Editor**: Criar e editar
- **Viewer**: Apenas visualizar

### Usuários Padrão
- Username: `developer`
- Grupo: Manager
- Apenas para ambiente de desenvolvimento

## Documentação

### Swagger/OpenAPI
```python
# settings.py
INSTALLED_APPS = [
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Project API',
    'DESCRIPTION': 'API description',
    'VERSION': '1.0.0',
}
```

### README.md
Sempre incluir:
1. Instruções de instalação (manual e Docker)
2. Credenciais padrão de desenvolvimento
3. Link para documentação da API (Swagger)
4. Endpoints principais

## Boas Práticas

### 1. Segurança
- Nunca hardcode credenciais em produção
- Usar variáveis de ambiente para secrets
- Validar todas as entradas de usuário
- Usar `is_staff` para acesso ao admin

### 2. Performance
- Usar `select_related` e `prefetch_related` quando apropriado
- Implementar paginação em listas
- Evitar N+1 queries

### 3. Manutenibilidade
- Código deve ser fácil de ler e entender
- Comentários apenas quando necessário
- Testes devem cobrir funcionalidades principais
- Migrations devem ser reversíveis

### 4. Git
- Commits descritivos
- Não commitar arquivos de ambiente (.env, db.sqlite3)
- Usar .gitignore apropriado

## Checklist para Novas Features

- [ ] Implementar models (se necessário)
- [ ] Criar serializers
- [ ] Implementar views/viewsets
- [ ] Configurar URLs
- [ ] Adicionar permissões apropriadas
- [ ] Criar migrations
- [ ] Escrever testes unitários
- [ ] Atualizar documentação (README, Swagger)
- [ ] Testar manualmente via Swagger UI
- [ ] Executar todos os testes: `python manage.py test`

## Comandos Úteis

```bash
# Criar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Executar testes
python manage.py test

# Executar testes de um app específico
python manage.py test app_name

# Criar superuser
python manage.py createsuperuser

# Executar servidor
python manage.py runserver

# Docker
docker compose up --build
docker compose down
```

## Estrutura de Resposta da API

### Sucesso
```json
{
  "id": 1,
  "username": "user",
  "email": "user@example.com"
}
```

### Erro
```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Lista Paginada
```json
{
  "count": 100,
  "next": "http://api.example.org/accounts/?page=2",
  "previous": null,
  "results": [...]
}
```

## Atualização desta Skill

Esta skill deve ser atualizada sempre que:
1. Novos padrões forem estabelecidos
2. Decisões arquiteturais importantes forem tomadas
3. Convenções de código mudarem
4. Novas ferramentas ou bibliotecas forem adicionadas ao projeto
