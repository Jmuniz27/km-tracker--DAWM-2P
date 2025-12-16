from django.contrib import admin
from .models import Vehiculo


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    """Configuración del admin para Vehiculo"""

    list_display = ['placa', 'marca', 'modelo', 'año', 'tipo', 'kilometraje_actual', 'usuario', 'activo']
    list_filter = ['tipo', 'activo', 'fecha_creacion']
    search_fields = ['placa', 'marca', 'modelo', 'numero_motor', 'numero_chasis']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']

    fieldsets = (
        ('Información del Usuario', {
            'fields': ('usuario',)
        }),
        ('Información Básica', {
            'fields': ('marca', 'modelo', 'año', 'placa', 'tipo', 'color')
        }),
        ('Especificaciones Técnicas', {
            'fields': ('kilometraje_actual', 'capacidad_tanque', 'numero_motor', 'numero_chasis')
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
        ('Metadata', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
