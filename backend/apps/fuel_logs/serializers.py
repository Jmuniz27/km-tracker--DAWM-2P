from rest_framework import serializers
from .models import CargaCombustible


class CargaCombustibleSerializer(serializers.ModelSerializer):
    """Serializer para el modelo CargaCombustible"""

    vehiculo_info = serializers.SerializerMethodField(read_only=True)
    rendimiento = serializers.ReadOnlyField()

    class Meta:
        model = CargaCombustible
        fields = [
            'id', 'vehiculo', 'vehiculo_info', 'fecha', 'kilometraje', 'galones',
            'precio_galon', 'costo_total', 'tipo_combustible', 'estacion_servicio',
            'tanque_lleno', 'notas', 'rendimiento', 'fecha_creacion',
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

    def validate_galones(self, value):
        """Valida que los galones sean positivos"""
        if value <= 0:
            raise serializers.ValidationError("Los galones deben ser mayores a 0")
        return value

    def validate_precio_galon(self, value):
        """Valida que el precio por galón sea positivo"""
        if value <= 0:
            raise serializers.ValidationError("El precio por galón debe ser mayor a 0")
        return value

    def validate_kilometraje(self, value):
        """Valida que el kilometraje sea positivo"""
        if value < 0:
            raise serializers.ValidationError("El kilometraje no puede ser negativo")
        return value

    def validate(self, data):
        """Validaciones a nivel de objeto"""
        # Verificar que el kilometraje no sea menor al kilometraje actual del vehículo
        if 'vehiculo' in data and 'kilometraje' in data:
            if data['kilometraje'] < data['vehiculo'].kilometraje_actual:
                raise serializers.ValidationError({
                    'kilometraje': 'El kilometraje no puede ser menor al kilometraje actual del vehículo'
                })

        # Calcular costo_total automáticamente si no se proporciona
        if 'galones' in data and 'precio_galon' in data:
            data['costo_total'] = data['galones'] * data['precio_galon']

        return data
