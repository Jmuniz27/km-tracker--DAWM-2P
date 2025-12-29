from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Avg, Count
from .models import CargaCombustible
from .serializers import CargaCombustibleSerializer


class CargaCombustibleViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo CargaCombustible"""

    queryset = CargaCombustible.objects.all()
    serializer_class = CargaCombustibleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tipo_combustible', 'estacion_servicio']
    ordering_fields = ['fecha', 'kilometraje', 'litros', 'costo_total']
    ordering = ['-fecha']

    def get_queryset(self):
        """Filtra las cargas por vehículos del usuario actual"""
        # Solo cargas de vehículos del usuario autenticado
        queryset = CargaCombustible.objects.filter(vehiculo__usuario=self.request.user)

        vehiculo_id = self.request.query_params.get('vehiculo')
        if vehiculo_id:
            queryset = queryset.filter(vehiculo_id=vehiculo_id)
        return queryset

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de consumo de combustible"""
        vehiculo_id = request.query_params.get('vehiculo')

        if not vehiculo_id:
            return Response(
                {'error': 'El parámetro vehiculo es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cargas = CargaCombustible.objects.filter(vehiculo_id=vehiculo_id)

        if not cargas.exists():
            return Response({
                'total_cargas': 0,
                'total_litros': 0,
                'total_costo': 0,
                'promedio_litros': 0,
                'promedio_costo': 0,
                'rendimiento_promedio': None
            })

        # Calcular estadísticas
        total_cargas = cargas.count()
        total_litros = cargas.aggregate(Sum('litros'))['litros__sum'] or 0
        total_costo = cargas.aggregate(Sum('costo_total'))['costo_total__sum'] or 0
        promedio_litros = cargas.aggregate(Avg('litros'))['litros__avg'] or 0
        promedio_costo = cargas.aggregate(Avg('costo_total'))['costo_total__avg'] or 0

        # Calcular rendimiento promedio (solo de cargas con tanque lleno)
        rendimientos = []
        for carga in cargas.filter(tanque_lleno=True):
            if carga.rendimiento:
                rendimientos.append(carga.rendimiento)

        rendimiento_promedio = sum(rendimientos) / len(rendimientos) if rendimientos else None

        return Response({
            'total_cargas': total_cargas,
            'total_litros': float(total_litros),
            'total_costo': float(total_costo),
            'promedio_litros': float(promedio_litros),
            'promedio_costo': float(promedio_costo),
            'rendimiento_promedio': rendimiento_promedio
        })
