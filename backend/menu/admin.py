from django.contrib import admin
from .models import Dishes # Verifique se o nome no seu models.py é Dish

@admin.register(Dishes)
class DishAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'dishDay', 'available')
    list_filter = ('dishDay', 'available')
    list_editable = ('price', 'dishDay', 'available')