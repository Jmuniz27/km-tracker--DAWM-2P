from rest_framework import serializers
from django.db import models
from .models import CargaCombustible
from apps.vehicles.models import Vehiculo


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
        read_only_fields = ['costo_total', 'fecha_creacion', 'fecha_actualizacion']

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
        vehiculo = data.get('vehiculo') or (self.instance.vehiculo if self.instance else None)
        kilometraje = data.get('kilometraje')
        
        if vehiculo and kilometraje:
            if kilometraje < vehiculo.kilometraje_actual:
                raise serializers.ValidationError({
                    'kilometraje': f'El kilometraje ({kilometraje} km) no puede ser menor al actual del vehículo ({vehiculo.kilometraje_actual} km)'
                })
            
            # Validar que los galones no excedan la capacidad del tanque
            galones = data.get('galones')
            if galones and galones > vehiculo.capacidad_tanque:
                raise serializers.ValidationError({
                    'galones': f'Los galones ({galones}) exceden la capacidad del tanque ({vehiculo.capacidad_tanque} gal)'
                })

        # Calcular costo_total automáticamente si no se proporciona
        if 'galones' in data and 'precio_galon' in data:
            data['costo_total'] = data['galones'] * data['precio_galon']

        return data

    def create(self, validated_data):
        """Crea la carga y actualiza el kilometraje del vehículo"""
        carga = CargaCombustible.objects.create(**validated_data)
        
        # Actualizar kilometraje del vehículo
        self._actualizar_kilometraje_vehiculo(carga.vehiculo, carga.kilometraje)
        
        return carga

    def update(self, instance, validated_data):
        """Actualiza la carga y el kilometraje del vehículo si cambió"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar kilometraje del vehículo si cambió
        if 'kilometraje' in validated_data:
            # Buscar el kilometraje máximo de todas las cargas
            max_km = CargaCombustible.objects.filter(
                vehiculo=instance.vehiculo
            ).aggregate(models.Max('kilometraje'))['kilometraje__max']
            
            if max_km:
                self._actualizar_kilometraje_vehiculo(instance.vehiculo, max_km)
        
        return instance

    def _actualizar_kilometraje_vehiculo(self, vehiculo, nuevo_kilometraje):
        """Método auxiliar para actualizar el kilometraje del vehículo"""
        if nuevo_kilometraje > vehiculo.kilometraje_actual:
            vehiculo.kilometraje_actual = nuevo_kilometraje
            vehiculo.save(update_fields=['kilometraje_actual', 'fecha_actualizacion'])

