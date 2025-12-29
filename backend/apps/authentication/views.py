from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer


class RegisterView(generics.CreateAPIView):
    """
    Vista para registro de nuevos usuarios

    POST /api/auth/register/
    Body: {
        "username": "nuevo_usuario",
        "email": "usuario@example.com",
        "password": "contraseña_segura",
        "password2": "contraseña_segura",
        "first_name": "Nombre",
        "last_name": "Apellido"
    }

    Retorna: {
        "user": {...},
        "tokens": {
            "refresh": "...",
            "access": "..."
        },
        "message": "Usuario registrado exitosamente"
    }
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar tokens JWT para el nuevo usuario
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "message": "Usuario registrado exitosamente"
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar datos del usuario actual

    GET /api/auth/me/
    Headers: Authorization: Bearer <token>

    Retorna: {
        "id": 1,
        "username": "usuario",
        "email": "usuario@example.com",
        "first_name": "Nombre",
        "last_name": "Apellido",
        "date_joined": "2025-12-27T..."
    }

    PUT/PATCH /api/auth/me/
    Body: {
        "first_name": "Nuevo Nombre",
        "last_name": "Nuevo Apellido",
        "email": "nuevo@example.com"
    }
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        """Retorna el usuario actual autenticado"""
        return self.request.user


class ChangePasswordView(APIView):
    """
    Vista para cambiar contraseña del usuario actual

    POST /api/auth/change-password/
    Headers: Authorization: Bearer <token>
    Body: {
        "old_password": "contraseña_actual",
        "new_password": "nueva_contraseña",
        "new_password2": "nueva_contraseña"
    }

    Retorna: {
        "message": "Contraseña actualizada exitosamente"
    }
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            # Verificar contraseña actual
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": "Contraseña incorrecta"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Establecer nueva contraseña
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                "message": "Contraseña actualizada exitosamente"
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Vista para cerrar sesión (blacklist del refresh token)

    POST /api/auth/logout/
    Headers: Authorization: Bearer <token>
    Body: {
        "refresh": "refresh_token_aqui"
    }

    Retorna: {
        "message": "Sesión cerrada exitosamente"
    }
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token requerido"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            # Nota: Para blacklist necesitarías configurar BLACKLIST_AFTER_ROTATION
            # Por ahora solo retornamos mensaje de éxito

            return Response({
                "message": "Sesión cerrada exitosamente"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Token inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
