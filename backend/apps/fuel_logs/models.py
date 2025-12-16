from django.db import models
from apps.vehicles.models import Vehiculo


class CargaCombustible(models.Model):
    """Modelo para registrar cargas de combustible"""

    TIPO_COMBUSTIBLE = [
        ('EXTRA', 'Extra'),
        ('SUPER', 'Super'),
        ('ECOPAIS', 'Ecopaís'),
        ('DIESEL', 'Diesel'),
    ]

    # Relación con vehículo
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE, related_name='cargas_combustible')

    # Información de la carga
    fecha = models.DateTimeField()
    kilometraje = models.PositiveIntegerField(help_text='Kilometraje al momento de la carga')
    litros = models.DecimalField(max_digits=6, decimal_places=2, help_text='Litros cargados')
    precio_litro = models.DecimalField(max_digits=6, decimal_places=2, help_text='Precio por litro')
    costo_total = models.DecimalField(max_digits=8, decimal_places=2)
    tipo_combustible = models.CharField(max_length=10, choices=TIPO_COMBUSTIBLE)

    # Información adicional
    estacion_servicio = models.CharField(max_length=100, blank=True, null=True)
    tanque_lleno = models.BooleanField(default=False, help_text='Indica si se llenó el tanque completamente')
    notas = models.TextField(blank=True, null=True)

    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Carga de Combustible'
        verbose_name_plural = 'Cargas de Combustible'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.vehiculo} - {self.fecha.strftime('%Y-%m-%d')} - {self.litros}L"

    @property
    def rendimiento(self):
        """Calcula el rendimiento (km/L) basado en la carga anterior"""
        carga_anterior = CargaCombustible.objects.filter(
            vehiculo=self.vehiculo,
            fecha__lt=self.fecha
        ).order_by('-fecha').first()

        if carga_anterior and self.tanque_lleno and carga_anterior.tanque_lleno:
            km_recorridos = self.kilometraje - carga_anterior.kilometraje
            if km_recorridos > 0 and self.litros > 0:
                return round(km_recorridos / float(self.litros), 2)
        return None
