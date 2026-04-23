from django.contrib import admin
from .models import MenuItem, Category, MenuItemSchedule


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'items_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('code', 'name')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Itens'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'display_categories',
        'display_weekdays',
        'lunch_box_price_small',
        'lunch_box_price_medium',
        'lunch_box_price_large',
        'daily_plate_price',
        'is_active',
        'created_at',
    ]
    list_filter = ['categories', 'is_active', 'created_at']
    search_fields = ['name', 'side_dish']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['categories']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'side_dish', 'image', 'categories')
        }),
        ('Availability', {
            'fields': ('weekdays', 'is_active'),
            'description': 'Leave weekdays empty for items available every day'
        }),
        ('Pricing', {
            'fields': (
                'lunch_box_price_small',
                'lunch_box_price_medium',
                'lunch_box_price_large',
                'daily_plate_price',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def display_categories(self, obj):
        return ', '.join([cat.name for cat in obj.categories.all()])
    display_categories.short_description = 'Categorias'
    
    def display_weekdays(self, obj):
        if not obj.weekdays:
            return 'Every day'
        return ', '.join([day.capitalize() for day in obj.weekdays])
    display_weekdays.short_description = 'Available Days'


@admin.register(MenuItemSchedule)
class MenuItemScheduleAdmin(admin.ModelAdmin):
    list_display = ['date', 'item', 'daily_price', 'is_open', 'note']
    list_filter = ['is_open', 'date']
    search_fields = ['item__name', 'note']
    ordering = ['date']