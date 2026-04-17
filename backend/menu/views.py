from datetime import datetime
from rest_framework import viewsets, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from .models import MenuItem, Category
from .serializers import MenuItemSerializer, CategorySerializer
from .permissions import IsEditorOrAbove


@extend_schema(
    tags=['Sistema'],
    summary='Health check da API',
    description='Retorna a data e hora atual do servidor em formato ISO 8601.',
    responses=inline_serializer(
        name='HealthResponse',
        fields={
            'data': serializers.DateTimeField()
        }
    ),
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({
        'data': datetime.now().isoformat()
    })


@extend_schema_view(
    list=extend_schema(tags=['Categorias']),
    retrieve=extend_schema(tags=['Categorias']),
    create=extend_schema(tags=['Categorias']),
    update=extend_schema(tags=['Categorias']),
    partial_update=extend_schema(tags=['Categorias']),
    destroy=extend_schema(tags=['Categorias']),
)
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'code'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEditorOrAbove()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Category.objects.all()
        
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


@extend_schema_view(
    list=extend_schema(tags=['Menu']),
    retrieve=extend_schema(tags=['Menu']),
    create=extend_schema(tags=['Menu']),
    update=extend_schema(tags=['Menu']),
    partial_update=extend_schema(tags=['Menu']),
    destroy=extend_schema(tags=['Menu']),
)
class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'side_dish', 'category']
    ordering_fields = ['name', 'created_at', 'category']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEditorOrAbove()]
        return [AllowAny()]

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