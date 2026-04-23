from datetime import datetime
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets, filters, serializers, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from .models import MenuItem, Category, MenuItemSchedule
from .serializers import MenuItemSerializer, CategorySerializer, MenuItemScheduleSerializer
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


@extend_schema(
    tags=['Dashboard'],
    summary='Estatísticas do Dashboard',
    description='Retorna estatísticas gerais do sistema para o painel administrativo.',
    responses=inline_serializer(
        name='DashboardStatsResponse',
        fields={
            'total_menu_items': serializers.IntegerField(),
            'active_menu_items': serializers.IntegerField(),
            'inactive_menu_items': serializers.IntegerField(),
            'total_categories': serializers.IntegerField(),
            'active_categories': serializers.IntegerField(),
            'items_with_lunch_box': serializers.IntegerField(),
            'items_with_daily_plate': serializers.IntegerField(),
            'categories_stats': serializers.ListField(
                child=inline_serializer(
                    name='CategoryStats',
                    fields={
                        'name': serializers.CharField(),
                        'code': serializers.CharField(),
                        'items_count': serializers.IntegerField(),
                    }
                )
            ),
        }
    ),
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Retorna estatísticas para o dashboard administrativo
    """
    # Contadores de menu items
    total_menu_items = MenuItem.objects.count()
    active_menu_items = MenuItem.objects.filter(is_active=True).count()
    inactive_menu_items = MenuItem.objects.filter(is_active=False).count()
    
    # Contadores de categorias
    total_categories = Category.objects.count()
    active_categories = Category.objects.filter(is_active=True).count()
    
    # Itens por tipo de preço
    items_with_lunch_box = MenuItem.objects.filter(
        Q(lunch_box_price_small__isnull=False) | 
        Q(lunch_box_price_medium__isnull=False) | 
        Q(lunch_box_price_large__isnull=False)
    ).count()
    
    items_with_daily_plate = MenuItem.objects.filter(
        daily_plate_price__isnull=False
    ).count()
    
    # Top categorias por número de itens
    categories_stats = Category.objects.annotate(
        items_count=Count('items')
    ).order_by('-items_count')[:5].values('name', 'code', 'items_count')
    
    return Response({
        'total_menu_items': total_menu_items,
        'active_menu_items': active_menu_items,
        'inactive_menu_items': inactive_menu_items,
        'total_categories': total_categories,
        'active_categories': active_categories,
        'items_with_lunch_box': items_with_lunch_box,
        'items_with_daily_plate': items_with_daily_plate,
        'categories_stats': list(categories_stats),
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
    queryset = MenuItem.objects.prefetch_related('categories').all()
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'side_dish', 'categories__name', 'categories__code']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEditorOrAbove()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = MenuItem.objects.prefetch_related('categories').all()

        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(categories__code=category)

        special_candidates = self.request.query_params.get('special_candidates', None)
        if special_candidates in ['1', 'true', 'True']:
            queryset = queryset.filter(
                is_active=True,
                categories__code='prato-do-dia',
            )

        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        apply_weekday_filter = (
            not (self.request.user and self.request.user.is_authenticated)
            or self.request.query_params.get('available_today') in ['1', 'true', 'True']
        )

        if apply_weekday_filter:
            current_weekday = datetime.now().strftime('%A').lower()
            filtered_items = []
            for item in queryset:
                if not item.weekdays or current_weekday in item.weekdays:
                    filtered_items.append(item.pk)

            queryset = queryset.filter(pk__in=filtered_items)

        queryset = queryset.distinct()

        return queryset


@extend_schema_view(
    list=extend_schema(tags=['Agenda']),
    retrieve=extend_schema(tags=['Agenda']),
    create=extend_schema(tags=['Agenda']),
    update=extend_schema(tags=['Agenda']),
    partial_update=extend_schema(tags=['Agenda']),
    destroy=extend_schema(tags=['Agenda']),
)
class MenuItemScheduleViewSet(viewsets.ModelViewSet):
    queryset = MenuItemSchedule.objects.select_related('item').prefetch_related('item__categories').all()
    serializer_class = MenuItemScheduleSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'created_at']
    ordering = ['date']

    def get_queryset(self):
        queryset = MenuItemSchedule.objects.select_related('item').prefetch_related('item__categories').all()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset.order_by('date')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_upsert']:
            return [IsAuthenticated(), IsEditorOrAbove()]
        return [AllowAny()]

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def today(self, request):
        today = timezone.localdate()
        schedule = MenuItemSchedule.objects.select_related('item').filter(date=today).first()

        if not schedule:
            return Response({
                'date': today,
                'is_open': True,
                'daily_price': None,
                'note': 'Infelizmente não temos prato do dia disponível hoje. Confira as outras opções do cardápio.',
                'item': None,
            })

        serializer = self.get_serializer(schedule)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsEditorOrAbove])
    def bulk_upsert(self, request):
        schedules = request.data.get('schedules', [])

        if not isinstance(schedules, list) or not schedules:
            return Response({'error': 'Informe uma lista de agendas.'}, status=400)

        response_payload = []

        try:
            with transaction.atomic():
                for item in schedules:
                    date_value = item.get('date')
                    schedule = MenuItemSchedule.objects.filter(date=date_value).first()

                    serializer = self.get_serializer(
                        schedule,
                        data=item,
                        partial=bool(schedule),
                    )
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    response_payload.append(serializer.data)
        except Exception as exc:
            return Response({'error': str(exc)}, status=400)

        return Response({'schedules': response_payload})