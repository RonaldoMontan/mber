from rest_framework import serializers
from .models import MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer para itens do cardápio.
    
    Valida que pelo menos um preço seja fornecido e que os dias da semana sejam válidos.
    Campos read-only: id, created_at, updated_at
    """
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
        extra_kwargs = {
            'name': {
                'help_text': 'Nome do prato ou item do cardápio'
            },
            'side_dish': {
                'help_text': 'Descrição dos acompanhamentos (ex: arroz, feijão, salada)',
                'required': False,
            },
            'image': {
                'help_text': 'URL da imagem do prato',
                'required': False,
            },
            'category': {
                'help_text': 'Categoria do item: main_dish (prato principal) ou others (outros)'
            },
            'lunch_box_price_small': {
                'help_text': 'Preço da marmita tamanho pequeno. Pelo menos um preço deve ser fornecido',
                'required': False,
            },
            'lunch_box_price_medium': {
                'help_text': 'Preço da marmita tamanho médio',
                'required': False,
            },
            'lunch_box_price_large': {
                'help_text': 'Preço da marmita tamanho grande',
                'required': False,
            },
            'daily_plate_price': {
                'help_text': 'Preço do prato do dia',
                'required': False,
            },
            'weekdays': {
                'help_text': 'Lista de dias da semana em que o item está disponível (monday, tuesday, etc.). Lista vazia = disponível todos os dias',
                'required': False,
            },
            'is_active': {
                'help_text': 'Indica se o item está ativo e disponível no cardápio'
            },
        }
    
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
