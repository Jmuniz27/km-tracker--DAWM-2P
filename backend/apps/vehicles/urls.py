from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehiculoViewSet, vehiculos_publicos

router = DefaultRouter()
router.register(r'', VehiculoViewSet, basename='vehiculo')

urlpatterns = [
    path('publicos/', vehiculos_publicos, name='vehiculos-publicos'),
    path('', include(router.urls)),
]
