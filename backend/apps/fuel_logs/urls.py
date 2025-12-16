from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CargaCombustibleViewSet

router = DefaultRouter()
router.register(r'', CargaCombustibleViewSet, basename='carga-combustible')

urlpatterns = [
    path('', include(router.urls)),
]
