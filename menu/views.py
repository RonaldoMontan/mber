from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import MenuItem
from .serializers import MenuItemSerializer
from .permissions import IsEditorOrAbove, IsAuthenticatedReadOnly


def health(request):
    return JsonResponse({
        'data': datetime.now().isoformat()
    })


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
