from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView, ChangePasswordView, LogoutView

urlpatterns = [
    # Registro de usuario
    path('register/', RegisterView.as_view(), name='auth-register'),

    # Login (obtener tokens JWT)
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),

    # Refrescar access token
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),

    # Obtener/actualizar datos del usuario actual
    path('me/', UserDetailView.as_view(), name='auth-me'),

    # Cambiar contraseña
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Logout
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
