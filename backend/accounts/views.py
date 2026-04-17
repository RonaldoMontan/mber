from rest_framework import viewsets, status, generics, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from django.db.models import Count
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample, inline_serializer
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    ChangePasswordSerializer,
    AssignGroupSerializer,
    LoginSerializer,
    LogoutSerializer
)
from .permissions import IsManager, IsOwnerOrManager


@extend_schema(
    tags=['Autenticação'],
    summary='Registrar novo usuário',
    description='''
    Cria um novo usuário no sistema. Este endpoint requer permissões de Manager.
    
    **Permissões necessárias:** Manager
    
    **Validações:**
    - Username deve ser único
    - Email deve ser válido
    - Senha deve atender aos requisitos de segurança do Django
    - As senhas (password e password2) devem ser iguais
    
    **Grupos disponíveis:**
    - Manager: Acesso completo
    - Editor: Criar e editar
    - Viewer: Apenas leitura
    ''',
    examples=[
        OpenApiExample(
            'Exemplo de registro',
            value={
                'username': 'user.editor',
                'email': 'user.editor@example.com',
                'password': 'SecurePass123!',
                'password2': 'SecurePass123!',
                'first_name': 'User',
                'last_name': 'Editor',
                'groups': ['Editor']
            },
            request_only=True,
        ),
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'user': {
                    'id': 2,
                    'username': 'user.editor',
                    'email': 'user.editor@example.com',
                    'first_name': 'User',
                    'last_name': 'Editor',
                    'groups': ['Editor'],
                    'is_active': True,
                    'date_joined': '2026-04-06T03:00:00Z'
                },
                'message': 'User created successfully'
            },
            response_only=True,
            status_codes=['201'],
        ),
    ],
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsManager]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully"
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Autenticação'],
    summary='Login de usuário',
    description='''
    Autentica um usuário e retorna tokens JWT (access e refresh).
    
    **Acesso:** Público (não requer autenticação)
    
    **Tokens retornados:**
    - **access**: Token de acesso (válido por 1 hora) - use este token para autenticar requisições
    - **refresh**: Token de renovação (válido por 7 dias) - use para obter novos access tokens
    
    **Como usar o token:**
    Adicione o access token no header de suas requisições:
    ```
    Authorization: Bearer <seu_access_token>
    ```
    
    **Possíveis erros:**
    - 401: Credenciais inválidas
    - 403: Conta de usuário desativada
    ''',
    examples=[
        OpenApiExample(
            'Exemplo de login',
            value={
                'username': 'developer',
                'password': 'dev123'
            },
            request_only=True,
        ),
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                'user': {
                    'id': 1,
                    'username': 'developer',
                    'email': 'developer@mber.com',
                    'first_name': 'Developer',
                    'last_name': 'User',
                    'groups': ['Manager'],
                    'is_active': True,
                    'date_joined': '2026-04-06T03:00:00Z'
                }
            },
            response_only=True,
            status_codes=['200'],
        ),
    ],
)
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response({
                    "error": "User account is disabled"
                }, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                "error": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(
    tags=['Autenticação'],
    summary='Logout de usuário',
    description='''
    Realiza o logout do usuário adicionando o refresh token à blacklist.
    
    **Permissões necessárias:** Usuário autenticado
    
    **Funcionamento:**
    - O refresh token enviado é adicionado à blacklist
    - Após o logout, o refresh token não poderá mais ser usado para gerar novos access tokens
    - O access token atual continuará válido até expirar (1 hora)
    
    **Nota de segurança:**
    Para segurança completa, descarte também o access token no lado do cliente.
    ''',
    examples=[
        OpenApiExample(
            'Exemplo de logout',
            value={
                'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
            },
            request_only=True,
        ),
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'message': 'Logout successful'
            },
            response_only=True,
            status_codes=['200'],
        ),
    ],
)
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Autenticação'],
    summary='Obter dados do usuário autenticado',
    description='''
    Retorna os dados completos do usuário atualmente autenticado.
    
    **Permissões necessárias:** Usuário autenticado
    
    **Dados retornados:**
    - Informações pessoais (nome, email, username)
    - Grupos e permissões
    - Status da conta (ativo/inativo)
    - Data de criação da conta
    
    **Uso comum:**
    Este endpoint é útil para:
    - Verificar o perfil do usuário logado
    - Exibir informações do usuário na interface
    - Validar permissões no lado do cliente
    ''',
    examples=[
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'id': 1,
                'username': 'developer',
                'email': 'developer@mber.com',
                'first_name': 'Developer',
                'last_name': 'User',
                'groups': ['Manager'],
                'is_active': True,
                'date_joined': '2026-04-06T03:00:00Z'
            },
            response_only=True,
            status_codes=['200'],
        ),
    ],
)
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema_view(
    list=extend_schema(
        tags=['Usuários'],
        summary='Listar usuários',
        description='''
        Lista todos os usuários do sistema.
        
        **Permissões:**
        - Manager: Vê todos os usuários
        - Outros grupos: Vê apenas seu próprio perfil
        
        **Paginação:**
        Retorna 10 usuários por página. Use o parâmetro `page` para navegar.
        ''',
    ),
    retrieve=extend_schema(
        tags=['Usuários'],
        summary='Obter detalhes de um usuário',
        description='''
        Retorna os detalhes completos de um usuário específico.
        
        **Permissões:**
        - Manager: Pode ver qualquer usuário
        - Outros grupos: Podem ver apenas seu próprio perfil
        ''',
    ),
    create=extend_schema(
        tags=['Usuários'],
        summary='Criar novo usuário',
        description='''
        Cria um novo usuário no sistema.
        
        **Permissões necessárias:** Manager
        
        **Nota:** Este endpoint tem a mesma funcionalidade que `/api/auth/register/`
        ''',
    ),
    update=extend_schema(
        tags=['Usuários'],
        summary='Atualizar usuário (PUT)',
        description='''
        Atualiza todos os campos de um usuário.
        
        **Permissões:**
        - Manager: Pode atualizar qualquer usuário
        - Outros grupos: Podem atualizar apenas seu próprio perfil
        ''',
    ),
    partial_update=extend_schema(
        tags=['Usuários'],
        summary='Atualizar usuário parcialmente (PATCH)',
        description='''
        Atualiza campos específicos de um usuário.
        
        **Permissões:**
        - Manager: Pode atualizar qualquer usuário
        - Outros grupos: Podem atualizar apenas seu próprio perfil
        ''',
    ),
    destroy=extend_schema(
        tags=['Usuários'],
        summary='Deletar usuário',
        description='''
        Remove um usuário do sistema.
        
        **Permissões necessárias:** Manager
        
        **Atenção:** Esta ação é irreversível.
        ''',
    ),
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsManager()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='Manager').exists():
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @extend_schema(
        tags=['Usuários'],
        summary='Atribuir grupo a um usuário',
        description='''
        Atribui um grupo de permissões a um usuário específico.
        
        **Permissões necessárias:** Manager
        
        **Grupos disponíveis:**
        - **Manager**: Acesso completo a todos os recursos
        - **Editor**: Pode criar e editar, mas não deletar
        - **Viewer**: Apenas leitura
        
        **Comportamento:**
        - Remove todos os grupos anteriores do usuário
        - Adiciona o novo grupo especificado
        - Um usuário pode ter apenas um grupo por vez
        
        **Nota:** Execute `python manage.py setup_permissions` se os grupos não existirem.
        ''',
        request=AssignGroupSerializer,
        examples=[
            OpenApiExample(
                'Atribuir grupo Editor',
                value={'group_name': 'Editor'},
                request_only=True,
            ),
            OpenApiExample(
                'Resposta de sucesso',
                value={
                    'message': 'User assigned to group Editor',
                    'user': {
                        'id': 2,
                        'username': 'user.editor',
                        'email': 'user.editor@example.com',
                        'first_name': 'User',
                        'last_name': 'Editor',
                        'groups': ['Editor'],
                        'is_active': True,
                        'date_joined': '2026-04-06T03:00:00Z'
                    }
                },
                response_only=True,
                status_codes=['200'],
            ),
        ],
    )
    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def assign_group(self, request, pk=None):
        user = self.get_object()
        serializer = AssignGroupSerializer(data=request.data)
        
        if serializer.is_valid():
            group_name = serializer.validated_data['group_name']
            
            try:
                group = Group.objects.get(name=group_name)
                user.groups.clear()
                user.groups.add(group)
                
                return Response({
                    "message": f"User assigned to group {group_name}",
                    "user": UserSerializer(user).data
                })
            except Group.DoesNotExist:
                return Response({
                    "error": f"Group {group_name} does not exist. Run 'python manage.py setup_permissions' first."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=['Usuários'],
        summary='Alterar senha de um usuário',
        description='''
        Permite alterar a senha de um usuário.
        
        **Permissões:**
        - Manager: Pode alterar a senha de qualquer usuário
        - Outros grupos: Podem alterar apenas sua própria senha
        
        **Validações:**
        - A senha antiga deve estar correta
        - A nova senha deve atender aos requisitos de segurança do Django
        - As senhas novas (new_password e new_password2) devem ser iguais
        
        **Requisitos de senha:**
        - Mínimo de 8 caracteres
        - Não pode ser muito similar aos dados do usuário
        - Não pode ser uma senha comum
        - Não pode ser totalmente numérica
        
        **Nota de segurança:**
        Após alterar a senha, os tokens JWT existentes continuam válidos até expirarem.
        Recomenda-se fazer logout e login novamente.
        ''',
        request=ChangePasswordSerializer,
        examples=[
            OpenApiExample(
                'Exemplo de alteração de senha',
                value={
                    'old_password': 'OldPassword123!',
                    'new_password': 'NewSecurePass456!',
                    'new_password2': 'NewSecurePass456!'
                },
                request_only=True,
            ),
            OpenApiExample(
                'Resposta de sucesso',
                value={
                    'message': 'Password updated successfully'
                },
                response_only=True,
                status_codes=['200'],
            ),
        ],
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnerOrManager])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    "error": "Old password is incorrect"
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                "message": "Password updated successfully"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Dashboard'],
    summary='Estatísticas de Usuários',
    description='Retorna estatísticas de usuários para o dashboard administrativo.',
    responses=inline_serializer(
        name='UserStatsResponse',
        fields={
            'total_users': serializers.IntegerField(),
            'active_users': serializers.IntegerField(),
            'inactive_users': serializers.IntegerField(),
            'users_by_group': serializers.ListField(
                child=inline_serializer(
                    name='GroupStats',
                    fields={
                        'group': serializers.CharField(),
                        'count': serializers.IntegerField(),
                    }
                )
            ),
        }
    ),
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Retorna estatísticas de usuários para o dashboard
    """
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = User.objects.filter(is_active=False).count()
    
    # Usuários por grupo
    users_by_group = Group.objects.annotate(
        count=Count('user')
    ).values('name', 'count').order_by('-count')
    
    users_by_group_formatted = [
        {'group': item['name'], 'count': item['count']}
        for item in users_by_group
    ]
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'users_by_group': users_by_group_formatted,
    })
