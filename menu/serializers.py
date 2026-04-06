from rest_framework import serializers
from .models import MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'side_dish',
            'image',
            'category',
            'lunch_box_price_small',
            'lunch_box_price_medium',
            'lunch_box_price_large',
            'daily_plate_price',
            'weekdays',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        if self.instance:
            lunch_box_prices = [
                data.get('lunch_box_price_small', self.instance.lunch_box_price_small),
                data.get('lunch_box_price_medium', self.instance.lunch_box_price_medium),
                data.get('lunch_box_price_large', self.instance.lunch_box_price_large),
            ]
            daily_price = data.get('daily_plate_price', self.instance.daily_plate_price)
        else:
            lunch_box_prices = [
                data.get('lunch_box_price_small'),
                data.get('lunch_box_price_medium'),
                data.get('lunch_box_price_large'),
            ]
            daily_price = data.get('daily_plate_price')
        
        if not any(lunch_box_prices) and not daily_price:
            raise serializers.ValidationError(
                'At least one price must be provided (lunch box or daily plate).'
            )
        
        weekdays = data.get('weekdays', [])
        if weekdays:
            valid_weekdays = [choice[0] for choice in MenuItem.WEEKDAY_CHOICES]
            for weekday in weekdays:
                if weekday not in valid_weekdays:
                    raise serializers.ValidationError({
                        'weekdays': f'Invalid weekday: {weekday}. Must be one of {valid_weekdays}'
                    })
        
        return data
