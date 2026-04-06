"""
Permission classes for menu app.

When you create menu models, you can use these permission classes
in your ViewSets to control access.

Example usage in menu/views.py:
    from rest_framework import viewsets
    from accounts.permissions import IsEditorOrAbove, IsAuthenticatedReadOnly
    
    class MenuItemViewSet(viewsets.ModelViewSet):
        queryset = MenuItem.objects.all()
        serializer_class = MenuItemSerializer
        permission_classes = [IsEditorOrAbove]  # Editors and Managers can edit
        
    class PublicMenuViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = MenuItem.objects.filter(is_active=True)
        serializer_class = MenuItemSerializer
        permission_classes = [IsAuthenticatedReadOnly]  # All authenticated users can view
"""

from accounts.permissions import (
    IsManager,
    IsEditorOrAbove,
    IsAuthenticatedReadOnly,
    IsOwnerOrManager
)

__all__ = [
    'IsManager',
    'IsEditorOrAbove', 
    'IsAuthenticatedReadOnly',
    'IsOwnerOrManager'
]
