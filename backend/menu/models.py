# backend/menu/models.py
from django.db import models

class Dishes(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)
    dishDay = models.BooleanField(default=False)
    category = models.CharField(max_length=50, choices=[
        ('almoco', 'Almoço'),
        ('porcoes', 'Porções'),
        ('bebidas', 'Bebidas')
    ])

    def __clstr__(self):
        return self.name