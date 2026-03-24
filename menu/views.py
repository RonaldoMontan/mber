from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime

def health(request):
    return JsonResponse({
        'data': datetime.now().isoformat()
    })
