from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para visualização e atualização de dados de usuários.
    
    Campos read-only: id, date_joined
    """
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        required=False,
        help_text='Grupos de permissão do usuário (Manager, Editor, Viewer)'
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'username': {
                'help_text': 'Nome de usuário único para login. Apenas letras, números e @/./+/-/_'
            },
            'email': {
                'help_text': 'Endereço de email do usuário'
            },
            'first_name': {
                'help_text': 'Primeiro nome do usuário'
            },
            'last_name': {
                'help_text': 'Sobrenome do usuário'
            },
            'is_active': {
                'help_text': 'Indica se o usuário está ativo. Usuários inativos não podem fazer login'
            },
        }


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários.
    
    Valida que as senhas coincidam e atendam aos requisitos de segurança.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        help_text='Senha do usuário. Deve ter no mínimo 8 caracteres e atender aos requisitos de segurança'
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        help_text='Confirmação da senha. Deve ser igual ao campo password'
    )
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        required=False,
        help_text='Grupos de permissão para atribuir ao novo usuário (Manager, Editor, Viewer)'
    )

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name', 'groups']
        extra_kwargs = {
            'username': {
                'help_text': 'Nome de usuário único. Apenas letras, números e @/./+/-/_'
            },
            'email': {
                'help_text': 'Endereço de email do usuário'
            },
            'first_name': {
                'help_text': 'Primeiro nome do usuário'
            },
            'last_name': {
                'help_text': 'Sobrenome do usuário'
            },
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        
        if groups:
            user.groups.set(groups)
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para alteração de senha de usuário.
    
    Valida que a senha antiga esteja correta e que as novas senhas coincidam.
    """
    old_password = serializers.CharField(
        required=True,
        help_text='Senha atual do usuário'
    )
    new_password = serializers.CharField(
        required=True, 
        validators=[validate_password],
        help_text='Nova senha. Deve ter no mínimo 8 caracteres e atender aos requisitos de segurança'
    )
    new_password2 = serializers.CharField(
        required=True,
        help_text='Confirmação da nova senha. Deve ser igual ao campo new_password'
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class AssignGroupSerializer(serializers.Serializer):
    """
    Serializer para atribuição de grupo a um usuário.
    
    Permite atribuir um dos três grupos de permissão disponíveis.
    """
    group_name = serializers.ChoiceField(
        choices=['Manager', 'Editor', 'Viewer'],
        help_text='Nome do grupo a ser atribuído. Manager: acesso completo, Editor: criar/editar, Viewer: apenas leitura'
    )


class LoginSerializer(serializers.Serializer):
    """
    Serializer para autenticação de usuário.
    
    Retorna tokens JWT (access e refresh) em caso de sucesso.
    """
    username = serializers.CharField(
        required=True,
        help_text='Nome de usuário para login'
    )
    password = serializers.CharField(
        required=True, 
        write_only=True,
        help_text='Senha do usuário'
    )


class LogoutSerializer(serializers.Serializer):
    """
    Serializer para logout de usuário.
    
    Adiciona o refresh token à blacklist para invalidá-lo.
    """
    refresh = serializers.CharField(
        required=True,
        help_text='Refresh token JWT a ser invalidado'
    )
