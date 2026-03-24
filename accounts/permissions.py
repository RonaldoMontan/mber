from rest_framework import permissions


class IsManager(permissions.BasePermission):
    """
    Permission class that only allows users in the 'Manager' group.
    Managers have full access to all operations.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        return request.user.groups.filter(name='Manager').exists()


class IsEditorOrAbove(permissions.BasePermission):
    """
    Permission class that allows users in 'Editor' or 'Manager' groups.
    Editors can create and update, but cannot delete.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if view.action == 'destroy':
            return request.user.groups.filter(name='Manager').exists()
        
        return request.user.groups.filter(name__in=['Manager', 'Editor']).exists()


class IsAuthenticatedReadOnly(permissions.BasePermission):
    """
    Permission class for read-only access.
    All authenticated users (including Viewer) can read.
    Only Editors and Managers can write.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.groups.filter(name__in=['Manager', 'Editor']).exists()


class IsOwnerOrManager(permissions.BasePermission):
    """
    Permission class that allows users to edit their own profile,
    or managers to edit any profile.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        if request.user.groups.filter(name='Manager').exists():
            return True
        
        return obj == request.user
