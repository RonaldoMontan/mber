from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
from rest_framework import viewsets, permissions
from .models import Dishes
from .serializers import DishesSerializer

def health(request):
    return JsonResponse({
        'data': datetime.now().isoformat()
    })

class DishViewSet(viewsets.ModelViewSet):
    queryset = Dishes.objects.all()
    serializer_class = DishesSerializer
    permission_classes = [permissions.AllowAny]