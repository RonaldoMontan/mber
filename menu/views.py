from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import MenuItem
from .serializers import MenuItemSerializer
from .permissions import IsEditorOrAbove, IsAuthenticatedReadOnly


@extend_schema(
    tags=['Sistema'],
    summary='Health check da API',
    description='''
    Endpoint de verificação de saúde da API.
    
    **Acesso:** Público (não requer autenticação)
    
    Retorna a data e hora atual do servidor em formato ISO 8601.
    Útil para verificar se a API está respondendo corretamente.
    ''',
    examples=[
        OpenApiExample(
            'Resposta de sucesso',
            value={
                'data': '2026-04-06T03:00:00.123456'
            },
            response_only=True,
            status_codes=['200'],
        ),
    ],
)
def health(request):
    return JsonResponse({
        'data': datetime.now().isoformat()
    })


@extend_schema_view(
    list=extend_schema(
        tags=['Menu'],
        summary='Listar itens do cardápio',
        description='''
        Lista todos os itens do cardápio com suporte a filtros, busca e ordenação.
        
        **Permissões:**
        - Editor e Manager: Acesso completo
        - Viewer: Apenas leitura
        
        **Filtros disponíveis:**
        - `category`: Filtra por categoria (main_dish ou others)
        - `is_active`: Filtra por status ativo (true ou false)
        - `search`: Busca por nome, acompanhamento ou categoria
        - `ordering`: Ordena por nome, created_at ou category (use - para ordem decrescente)
        
        **Filtro automático por dia da semana:**
        A API automaticamente filtra itens disponíveis no dia atual da semana.
        Itens sem dias específicos são sempre exibidos.
        
        **Paginação:**
        Retorna 10 itens por página. Use o parâmetro `page` para navegar.
        
        **Exemplos de uso:**
        - `/api/menu/?category=main_dish` - Apenas pratos principais
        - `/api/menu/?is_active=true` - Apenas itens ativos
        - `/api/menu/?search=frango` - Busca por "frango"
        - `/api/menu/?ordering=-created_at` - Mais recentes primeiro
        ''',
        parameters=[
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filtra por categoria do item',
                enum=['main_dish', 'others'],
            ),
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filtra por status ativo',
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Busca por nome, acompanhamento ou categoria',
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Campo para ordenação (use - para ordem decrescente)',
                enum=['name', '-name', 'created_at', '-created_at', 'category', '-category'],
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=['Menu'],
        summary='Obter detalhes de um item do cardápio',
        description='''
        Retorna os detalhes completos de um item específico do cardápio.
        
        **Permissões:**
        - Editor e Manager: Acesso completo
        - Viewer: Apenas leitura
        ''',
    ),
    create=extend_schema(
        tags=['Menu'],
        summary='Criar novo item do cardápio',
        description='''
        Cria um novo item no cardápio.
        
        **Permissões necessárias:** Editor ou Manager
        
        **Validações:**
        - Pelo menos um preço deve ser fornecido (marmita ou prato do dia)
        - Dias da semana devem ser válidos (monday, tuesday, etc.)
        - Categoria deve ser main_dish ou others
        
        **Dias da semana válidos:**
        monday, tuesday, wednesday, thursday, friday, saturday, sunday
        ''',
        examples=[
            OpenApiExample(
                'Exemplo de criação',
                value={
                    'name': 'Grilled Chicken',
                    'side_dish': 'Rice, beans, salad and french fries',
                    'image': 'https://example.com/grilled-chicken.jpg',
                    'category': 'main_dish',
                    'lunch_box_price_small': '15.00',
                    'lunch_box_price_medium': '18.00',
                    'lunch_box_price_large': '22.00',
                    'daily_plate_price': '20.00',
                    'weekdays': ['monday', 'wednesday', 'friday'],
                    'is_active': True
                },
                request_only=True,
            ),
        ],
    ),
    update=extend_schema(
        tags=['Menu'],
        summary='Atualizar item do cardápio (PUT)',
        description='''
        Atualiza todos os campos de um item do cardápio.
        
        **Permissões necessárias:** Editor ou Manager
        ''',
    ),
    partial_update=extend_schema(
        tags=['Menu'],
        summary='Atualizar item parcialmente (PATCH)',
        description='''
        Atualiza campos específicos de um item do cardápio.
        
        **Permissões necessárias:** Editor ou Manager
        ''',
    ),
    destroy=extend_schema(
        tags=['Menu'],
        summary='Deletar item do cardápio',
        description='''
        Remove um item do cardápio.
        
        **Permissões necessárias:** Manager
        
        **Atenção:** Esta ação é irreversível.
        ''',
    ),
)
class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsEditorOrAbove]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'side_dish', 'category']
    ordering_fields = ['name', 'created_at', 'category']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = MenuItem.objects.all()
        
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        current_weekday = datetime.now().strftime('%A').lower()
        filtered_items = []
        for item in queryset:
            if not item.weekdays or current_weekday in item.weekdays:
                filtered_items.append(item.pk)
        
        queryset = queryset.filter(pk__in=filtered_items)
        
        return queryset
