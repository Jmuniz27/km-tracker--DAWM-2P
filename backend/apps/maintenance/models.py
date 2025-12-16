from django.db import models
from django.utils import timezone
from apps.vehicles.models import Vehiculo


class Mantenimiento(models.Model):
    """Modelo para registrar mantenimientos de vehículos"""

    TIPO_MANTENIMIENTO = [
        ('PREVENTIVO', 'Preventivo'),
        ('CORRECTIVO', 'Correctivo'),
        ('EMERGENCIA', 'Emergencia'),
    ]

    CATEGORIA_MANTENIMIENTO = [
        ('MOTOR', 'Motor'),
        ('FRENOS', 'Frenos'),
        ('SUSPENSION', 'Suspensión'),
        ('ELECTRICO', 'Eléctrico'),
        ('TRANSMISION', 'Transmisión'),
        ('NEUMATICOS', 'Neumáticos'),
        ('CARROCERIA', 'Carrocería'),
        ('CLIMATIZACION', 'Climatización'),
        ('OTRO', 'Otro'),
    ]

    # Relación con vehículo
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='mantenimientos')

    # Información del mantenimiento
    fecha = models.DateTimeField()
    tipo = models.CharField(max_length=15, choices=TIPO_MANTENIMIENTO)
    categoria = models.CharField(max_length=15, choices=CATEGORIA_MANTENIMIENTO)
    descripcion = models.TextField()
    kilometraje = models.PositiveIntegerField(help_text='Kilometraje al momento del mantenimiento')
    costo = models.DecimalField(max_digits=10, decimal_places=2)

    # Información adicional
    taller = models.CharField(max_length=100, blank=True, null=True)
    repuestos_utilizados = models.TextField(blank=True, null=True, help_text='Lista de repuestos utilizados')

    # Seguimiento
    proximo_mantenimiento_km = models.PositiveIntegerField(blank=True, null=True)
    proximo_mantenimiento_fecha = models.DateField(blank=True, null=True)
    completado = models.BooleanField(default=True)

    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Mantenimiento'
        verbose_name_plural = 'Mantenimientos'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.vehiculo} - {self.get_tipo_display()} - {self.fecha.strftime('%Y-%m-%d')}"


class AlertaMantenimiento(models.Model):
    """Modelo para alertas y recordatorios de mantenimiento"""

    PRIORIDAD = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
        ('URGENTE', 'Urgente'),
    ]

    # Relación con vehículo
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='alertas_mantenimiento')

    # Información de la alerta
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    kilometraje_objetivo = models.PositiveIntegerField(blank=True, null=True, help_text='Kilometraje objetivo para el mantenimiento')
    fecha_objetivo = models.DateField(blank=True, null=True, help_text='Fecha objetivo para el mantenimiento')
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD, default='MEDIA')

    # Estado
    activa = models.BooleanField(default=True)
    mantenimiento_relacionado = models.ForeignKey(Mantenimiento, on_delete=models.SET_NULL, null=True, blank=True, related_name='alertas')

    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Alerta de Mantenimiento'
        verbose_name_plural = 'Alertas de Mantenimiento'
        ordering = ['-prioridad', 'fecha_objetivo']

    def __str__(self):
        return f"{self.vehiculo} - {self.titulo}"

    @property
    def esta_vencida(self):
        """Verifica si la alerta está vencida"""
        if not self.activa:
            return False

        if self.fecha_objetivo and self.fecha_objetivo < timezone.now().date():
            return True

        if self.kilometraje_objetivo and self.vehiculo.kilometraje_actual >= self.kilometraje_objetivo:
            return True

        return False
