# backend/menu/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class Category(models.Model):
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Código',
        help_text='Código único da categoria (ex: almoco, porcoes, bebidas)'
    )
    name = models.CharField(max_length=100, verbose_name='Nome')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        ordering = ['name']
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    
    name = models.CharField(max_length=200, verbose_name='Name')
    side_dish = models.TextField(verbose_name='Side Dish', blank=True)
    image = models.URLField(max_length=500, verbose_name='Image URL', blank=True)
    categories = models.ManyToManyField(
        Category,
        related_name='items',
        verbose_name='Categorias',
        help_text='Categorias às quais este item pertence'
    )
    
    lunch_box_price_small = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Lunch Box Price (Small)'
    )
    lunch_box_price_medium = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Lunch Box Price (Medium)'
    )
    lunch_box_price_large = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Lunch Box Price (Large)'
    )
    daily_plate_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Daily Plate Price'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'
    
    def __str__(self):
        return self.name
    
    def clean(self):
        if not any([
            self.lunch_box_price_small,
            self.lunch_box_price_medium,
            self.lunch_box_price_large,
            self.daily_plate_price
        ]):
            raise ValidationError(
                'At least one price must be provided (lunch box or daily plate).'
            )
        


class MenuItemSchedule(models.Model):
    date = models.DateField(unique=True, verbose_name='Date')
    item = models.ForeignKey(
        MenuItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedules',
        verbose_name='Menu Item'
    )
    is_open = models.BooleanField(default=True, verbose_name='Is Open')
    daily_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Daily Price Override'
    )
    note = models.CharField(max_length=255, blank=True, verbose_name='Note')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')

    class Meta:
        ordering = ['date']
        verbose_name = 'Menu Item Schedule'
        verbose_name_plural = 'Menu Item Schedules'

    def __str__(self):
        item_name = self.item.name if self.item else 'Sem item'
        return f'{self.date} - {item_name}'