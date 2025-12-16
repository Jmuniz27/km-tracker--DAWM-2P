from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MantenimientoViewSet, AlertaMantenimientoViewSet

router = DefaultRouter()
router.register(r'mantenimientos', MantenimientoViewSet, basename='mantenimiento')
router.register(r'alertas', AlertaMantenimientoViewSet, basename='alerta-mantenimiento')

urlpatterns = [
    path('', include(router.urls)),
]
