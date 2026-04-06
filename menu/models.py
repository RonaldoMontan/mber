from django.db import models
from django.core.exceptions import ValidationError


class MenuItem(models.Model):
    MAIN_DISH = 'main_dish'
    OTHERS = 'others'
    
    CATEGORY_CHOICES = [
        (MAIN_DISH, 'Main Dish'),
        (OTHERS, 'Others'),
    ]
    
    MONDAY = 'monday'
    TUESDAY = 'tuesday'
    WEDNESDAY = 'wednesday'
    THURSDAY = 'thursday'
    FRIDAY = 'friday'
    SATURDAY = 'saturday'
    SUNDAY = 'sunday'
    
    WEEKDAY_CHOICES = [
        (MONDAY, 'Monday'),
        (TUESDAY, 'Tuesday'),
        (WEDNESDAY, 'Wednesday'),
        (THURSDAY, 'Thursday'),
        (FRIDAY, 'Friday'),
        (SATURDAY, 'Saturday'),
        (SUNDAY, 'Sunday'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Name')
    side_dish = models.TextField(verbose_name='Side Dish', blank=True)
    image = models.URLField(max_length=500, verbose_name='Image URL', blank=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=MAIN_DISH,
        verbose_name='Category'
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
    
    weekdays = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Available Weekdays',
        help_text='List of weekdays when this item is available. Empty list means available every day.'
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
        
        valid_weekdays = [choice[0] for choice in self.WEEKDAY_CHOICES]
        if self.weekdays:
            for weekday in self.weekdays:
                if weekday not in valid_weekdays:
                    raise ValidationError(
                        f'Invalid weekday: {weekday}. Must be one of {valid_weekdays}'
                    )
    
    def is_available_on_weekday(self, weekday):
        if not self.weekdays:
            return True
        return weekday.lower() in self.weekdays
