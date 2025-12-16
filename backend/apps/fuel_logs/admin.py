from django.contrib import admin
from .models import CargaCombustible


@admin.register(CargaCombustible)
class CargaCombustibleAdmin(admin.ModelAdmin):
    """Configuración del admin para CargaCombustible"""

    list_display = ['vehiculo', 'fecha', 'litros', 'tipo_combustible', 'costo_total', 'kilometraje', 'tanque_lleno']
    list_filter = ['tipo_combustible', 'tanque_lleno', 'fecha']
    search_fields = ['vehiculo__placa', 'vehiculo__marca', 'vehiculo__modelo', 'estacion_servicio']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'rendimiento']
    date_hierarchy = 'fecha'

    fieldsets = (
        ('Vehículo', {
            'fields': ('vehiculo',)
        }),
        ('Información de la Carga', {
            'fields': ('fecha', 'kilometraje', 'litros', 'precio_litro', 'costo_total', 'tipo_combustible', 'tanque_lleno')
        }),
        ('Información Adicional', {
            'fields': ('estacion_servicio', 'notas')
        }),
        ('Rendimiento', {
            'fields': ('rendimiento',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def rendimiento(self, obj):
        """Muestra el rendimiento calculado"""
        rend = obj.rendimiento
        return f"{rend} km/L" if rend else "N/A"
    rendimiento.short_description = 'Rendimiento'
