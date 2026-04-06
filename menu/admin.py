from django.contrib import admin
from .models import MenuItem


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'display_weekdays',
        'lunch_box_price_small',
        'lunch_box_price_medium',
        'lunch_box_price_large',
        'daily_plate_price',
        'is_active',
        'created_at',
    ]
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'side_dish']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'side_dish', 'image', 'category')
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
    
    def display_weekdays(self, obj):
        if not obj.weekdays:
            return 'Every day'
        return ', '.join([day.capitalize() for day in obj.weekdays])
    display_weekdays.short_description = 'Available Days'
