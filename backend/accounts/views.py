from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    ChangePasswordSerializer,
    AssignGroupSerializer,
    LoginSerializer,
    LogoutSerializer
)
from .permissions import IsManager, IsOwnerOrManager


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsManager]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully"
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response({
                    "error": "User account is disabled"
                }, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                "error": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManager]

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsManager()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='Manager').exists():
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def assign_group(self, request, pk=None):
        user = self.get_object()
        serializer = AssignGroupSerializer(data=request.data)
        
        if serializer.is_valid():
            group_name = serializer.validated_data['group_name']
            
            try:
                group = Group.objects.get(name=group_name)
                user.groups.clear()
                user.groups.add(group)
                
                return Response({
                    "message": f"User assigned to group {group_name}",
                    "user": UserSerializer(user).data
                })
            except Group.DoesNotExist:
                return Response({
                    "error": f"Group {group_name} does not exist. Run 'python manage.py setup_permissions' first."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnerOrManager])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    "error": "Old password is incorrect"
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                "message": "Password updated successfully"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
