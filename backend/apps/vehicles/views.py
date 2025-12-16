from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehiculo
from .serializers import VehiculoSerializer


class VehiculoViewSet(viewsets.ModelViewSet):
    """ViewSet para el modelo Vehiculo"""

    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['marca', 'modelo', 'placa', 'tipo']
    ordering_fields = ['fecha_creacion', 'marca', 'modelo', 'año', 'kilometraje_actual']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """Filtra los vehículos del usuario actual"""
        queryset = super().get_queryset()
        # Filtrar por usuario si se proporciona el parámetro
        usuario_id = self.request.query_params.get('usuario')
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)

        # Filtrar solo activos si se especifica
        solo_activos = self.request.query_params.get('activos')
        if solo_activos and solo_activos.lower() == 'true':
            queryset = queryset.filter(activo=True)

        return queryset

    @action(detail=True, methods=['post'])
    def actualizar_kilometraje(self, request, pk=None):
        """Actualiza el kilometraje del vehículo"""
        vehiculo = self.get_object()
        nuevo_kilometraje = request.data.get('kilometraje')

        if not nuevo_kilometraje:
            return Response(
                {'error': 'El campo kilometraje es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            nuevo_kilometraje = int(nuevo_kilometraje)
        except ValueError:
            return Response(
                {'error': 'El kilometraje debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_kilometraje < vehiculo.kilometraje_actual:
            return Response(
                {'error': 'El nuevo kilometraje no puede ser menor al actual'},
                status=status.HTTP_400_BAD_REQUEST
            )

        vehiculo.kilometraje_actual = nuevo_kilometraje
        vehiculo.save()

        serializer = self.get_serializer(vehiculo)
        return Response(serializer.data)
