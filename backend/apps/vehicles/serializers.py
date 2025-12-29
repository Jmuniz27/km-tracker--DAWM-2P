from rest_framework import serializers
from .models import Vehiculo


class VehiculoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Vehiculo"""

    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Vehiculo
        fields = [
            'id', 'usuario', 'usuario_nombre', 'marca', 'modelo', 'año', 'placa',
            'tipo', 'kilometraje_actual', 'capacidad_tanque', 'color',
            'numero_motor', 'numero_chasis', 'fecha_creacion',
            'fecha_actualizacion', 'activo'
        ]
        read_only_fields = ['id', 'usuario', 'usuario_nombre', 'fecha_creacion', 'fecha_actualizacion']

    def validate_año(self, value):
        """Valida que el año sea razonable"""
        from datetime import datetime
        año_actual = datetime.now().year
        if value < 1900 or value > año_actual + 1:
            raise serializers.ValidationError(
                f"El año debe estar entre 1900 y {año_actual + 1}"
            )
        return value

    def validate_kilometraje_actual(self, value):
        """Valida que el kilometraje sea positivo"""
        if value < 0:
            raise serializers.ValidationError("El kilometraje no puede ser negativo")
        return value

    def validate_capacidad_tanque(self, value):
        """Valida que la capacidad del tanque sea positiva"""
        if value <= 0:
            raise serializers.ValidationError("La capacidad del tanque debe ser mayor a 0")
        return value
