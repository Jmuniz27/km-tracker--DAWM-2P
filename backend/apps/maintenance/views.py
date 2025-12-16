from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from .models import Mantenimiento, AlertaMantenimiento
from .serializers import MantenimientoSerializer, AlertaMantenimientoSerializer


class MantenimientoViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Mantenimiento"""

    queryset = Mantenimiento.objects.all()
    serializer_class = MantenimientoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tipo', 'categoria', 'descripcion', 'taller']
    ordering_fields = ['fecha', 'kilometraje', 'costo']
    ordering = ['-fecha']

    def get_queryset(self):
        """Filtra los mantenimientos por vehículo"""
        queryset = super().get_queryset()
        vehiculo_id = self.request.query_params.get('vehiculo')
        if vehiculo_id:
            queryset = queryset.filter(vehiculo_id=vehiculo_id)

        # Filtrar por tipo
        tipo = self.request.query_params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)

        # Filtrar por completado
        completado = self.request.query_params.get('completado')
        if completado:
            queryset = queryset.filter(completado=completado.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de mantenimiento"""
        vehiculo_id = request.query_params.get('vehiculo')

        if not vehiculo_id:
            return Response(
                {'error': 'El parámetro vehiculo es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        mantenimientos = Mantenimiento.objects.filter(vehiculo_id=vehiculo_id)

        if not mantenimientos.exists():
            return Response({
                'total_mantenimientos': 0,
                'total_costo': 0,
                'promedio_costo': 0,
                'por_tipo': {},
                'por_categoria': {}
            })

        total_mantenimientos = mantenimientos.count()
        total_costo = mantenimientos.aggregate(Sum('costo'))['costo__sum'] or 0
        promedio_costo = mantenimientos.aggregate(Avg('costo'))['costo__avg'] or 0

        # Estadísticas por tipo
        por_tipo = {}
        for tipo_choice in Mantenimiento.TIPO_MANTENIMIENTO:
            tipo_key = tipo_choice[0]
            count = mantenimientos.filter(tipo=tipo_key).count()
            if count > 0:
                por_tipo[tipo_key] = count

        # Estadísticas por categoría
        por_categoria = {}
        for cat_choice in Mantenimiento.CATEGORIA_MANTENIMIENTO:
            cat_key = cat_choice[0]
            count = mantenimientos.filter(categoria=cat_key).count()
            if count > 0:
                por_categoria[cat_key] = count

        return Response({
            'total_mantenimientos': total_mantenimientos,
            'total_costo': float(total_costo),
            'promedio_costo': float(promedio_costo),
            'por_tipo': por_tipo,
            'por_categoria': por_categoria
        })


class AlertaMantenimientoViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo AlertaMantenimiento"""

    queryset = AlertaMantenimiento.objects.all()
    serializer_class = AlertaMantenimientoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['fecha_objetivo', 'kilometraje_objetivo', 'prioridad']
    ordering = ['-prioridad', 'fecha_objetivo']

    def get_queryset(self):
        """Filtra las alertas por vehículo"""
        queryset = super().get_queryset()
        vehiculo_id = self.request.query_params.get('vehiculo')
        if vehiculo_id:
            queryset = queryset.filter(vehiculo_id=vehiculo_id)

        # Filtrar solo activas
        solo_activas = self.request.query_params.get('activas')
        if solo_activas and solo_activas.lower() == 'true':
            queryset = queryset.filter(activa=True)

        return queryset

    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Retorna todas las alertas vencidas"""
        vehiculo_id = request.query_params.get('vehiculo')
        queryset = self.get_queryset()

        if vehiculo_id:
            queryset = queryset.filter(vehiculo_id=vehiculo_id)

        # Filtrar solo alertas activas
        queryset = queryset.filter(activa=True)

        # Obtener alertas vencidas
        alertas_vencidas = []
        for alerta in queryset:
            if alerta.esta_vencida:
                alertas_vencidas.append(alerta)

        serializer = self.get_serializer(alertas_vencidas, many=True)
        return Response(serializer.data)
