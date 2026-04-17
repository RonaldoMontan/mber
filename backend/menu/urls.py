from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'menu', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path('', include(router.urls)),
]
