from rest_framework import serializers
from .models import MenuItem, Category, MenuItemSchedule


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'code',
            'name',
            'is_active',
            'items_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer para itens do cardápio.
    
    Valida que pelo menos um preço seja fornecido e que os dias da semana sejam válidos.
    Campos read-only: id, created_at, updated_at
    """
    categories_detail = CategorySerializer(source='categories', many=True, read_only=True)
    category_codes = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text='Lista de códigos de categorias'
    )
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'side_dish',
            'image',
            'categories_detail',
            'category_codes',
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
    
    def create(self, validated_data):
        category_codes = validated_data.pop('category_codes', [])
        item = MenuItem.objects.create(**validated_data)
        
        if category_codes:
            categories = Category.objects.filter(code__in=category_codes)
            item.categories.set(categories)
        
        return item
    
    def update(self, instance, validated_data):
        category_codes = validated_data.pop('category_codes', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if category_codes is not None:
            categories = Category.objects.filter(code__in=category_codes)
            instance.categories.set(categories)
        
        return instance


class MenuItemScheduleSerializer(serializers.ModelSerializer):
    item = MenuItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        source='item',
        queryset=MenuItem.objects.filter(
            is_active=True,
            categories__code='prato-do-dia',
        ).distinct(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = MenuItemSchedule
        fields = ['id', 'date', 'item', 'item_id', 'is_open', 'daily_price', 'note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        is_open = attrs.get('is_open', getattr(self.instance, 'is_open', True))
        item = attrs.get('item', getattr(self.instance, 'item', None))

        if is_open and item is None:
            raise serializers.ValidationError({
                'item_id': 'Selecione um prato para dias marcados como abertos.'
            })

        if item and not item.categories.filter(code='prato-do-dia').exists():
            raise serializers.ValidationError({
                'item_id': 'Somente itens marcados como prato do dia podem ser agendados.'
            })

        if item and not item.is_active:
            raise serializers.ValidationError({
                'item_id': 'Somente itens ativos podem ser agendados.'
            })

        return attrs
