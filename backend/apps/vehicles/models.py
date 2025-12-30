from django.db import models
from django.contrib.auth.models import User


class Vehiculo(models.Model):
    """Modelo para almacenar información de vehículos"""

    TIPO_VEHICULO = [
        ('AUTO', 'Automóvil'),
        ('MOTO', 'Motocicleta'),
        ('CAMION', 'Camión'),
        ('SUV', 'SUV'),
        ('VAN', 'Van'),
    ]

    # Información del usuario
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehiculos')

    # Información básica del vehículo
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    año = models.PositiveIntegerField()
    placa = models.CharField(max_length=20, unique=True)
    tipo = models.CharField(max_length=10, choices=TIPO_VEHICULO, default='AUTO')

    # Información de kilometraje y capacidad
    kilometraje_actual = models.PositiveIntegerField(default=0)
    capacidad_tanque = models.DecimalField(max_digits=5, decimal_places=2, help_text='Capacidad del tanque en galones')

    # Información adicional
    color = models.CharField(max_length=30, blank=True, null=True)
    numero_motor = models.CharField(max_length=50, blank=True, null=True)
    numero_chasis = models.CharField(max_length=50, blank=True, null=True)

    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.placa})"
