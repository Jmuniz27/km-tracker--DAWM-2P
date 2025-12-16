from rest_framework import serializers
from .models import Mantenimiento, AlertaMantenimiento


class MantenimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Mantenimiento"""

    vehiculo_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Mantenimiento
        fields = [
            'id', 'vehiculo', 'vehiculo_info', 'fecha', 'tipo', 'categoria',
            'descripcion', 'kilometraje', 'costo', 'taller', 'repuestos_utilizados',
            'proximo_mantenimiento_km', 'proximo_mantenimiento_fecha', 'completado',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_vehiculo_info(self, obj):
        """Retorna información básica del vehículo"""
        return {
            'id': obj.vehiculo.id,
            'marca': obj.vehiculo.marca,
            'modelo': obj.vehiculo.modelo,
            'placa': obj.vehiculo.placa
        }

    def validate_costo(self, value):
        """Valida que el costo sea positivo"""
        if value < 0:
            raise serializers.ValidationError("El costo no puede ser negativo")
        return value

    def validate_kilometraje(self, value):
        """Valida que el kilometraje sea positivo"""
        if value < 0:
            raise serializers.ValidationError("El kilometraje no puede ser negativo")
        return value


class AlertaMantenimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo AlertaMantenimiento"""

    vehiculo_info = serializers.SerializerMethodField(read_only=True)
    esta_vencida = serializers.ReadOnlyField()

    class Meta:
        model = AlertaMantenimiento
        fields = [
            'id', 'vehiculo', 'vehiculo_info', 'titulo', 'descripcion',
            'kilometraje_objetivo', 'fecha_objetivo', 'prioridad', 'activa',
            'mantenimiento_relacionado', 'esta_vencida', 'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_vehiculo_info(self, obj):
        """Retorna información básica del vehículo"""
        return {
            'id': obj.vehiculo.id,
            'marca': obj.vehiculo.marca,
            'modelo': obj.vehiculo.modelo,
            'placa': obj.vehiculo.placa
        }

    def validate(self, data):
        """Validaciones a nivel de objeto"""
        # Al menos uno de los objetivos debe estar presente
        if not data.get('kilometraje_objetivo') and not data.get('fecha_objetivo'):
            raise serializers.ValidationError(
                "Debe especificar al menos un kilometraje objetivo o una fecha objetivo"
            )
        return data
