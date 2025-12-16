from django.contrib import admin
from .models import Mantenimiento, AlertaMantenimiento


@admin.register(Mantenimiento)
class MantenimientoAdmin(admin.ModelAdmin):
    """Configuración del admin para Mantenimiento"""

    list_display = ['vehiculo', 'fecha', 'tipo', 'categoria', 'costo', 'kilometraje', 'completado']
    list_filter = ['tipo', 'categoria', 'completado', 'fecha']
    search_fields = ['vehiculo__placa', 'vehiculo__marca', 'vehiculo__modelo', 'descripcion', 'taller']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    date_hierarchy = 'fecha'

    fieldsets = (
        ('Vehículo', {
            'fields': ('vehiculo',)
        }),
        ('Información del Mantenimiento', {
            'fields': ('fecha', 'tipo', 'categoria', 'descripcion', 'kilometraje', 'costo', 'completado')
        }),
        ('Detalles Adicionales', {
            'fields': ('taller', 'repuestos_utilizados')
        }),
        ('Seguimiento', {
            'fields': ('proximo_mantenimiento_km', 'proximo_mantenimiento_fecha')
        }),
        ('Metadata', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AlertaMantenimiento)
class AlertaMantenimientoAdmin(admin.ModelAdmin):
    """Configuración del admin para AlertaMantenimiento"""

    list_display = ['vehiculo', 'titulo', 'prioridad', 'fecha_objetivo', 'kilometraje_objetivo', 'activa', 'esta_vencida_display']
    list_filter = ['prioridad', 'activa', 'fecha_objetivo']
    search_fields = ['vehiculo__placa', 'vehiculo__marca', 'vehiculo__modelo', 'titulo', 'descripcion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'esta_vencida']

    fieldsets = (
        ('Vehículo', {
            'fields': ('vehiculo',)
        }),
        ('Información de la Alerta', {
            'fields': ('titulo', 'descripcion', 'prioridad')
        }),
        ('Objetivos', {
            'fields': ('kilometraje_objetivo', 'fecha_objetivo')
        }),
        ('Estado', {
            'fields': ('activa', 'mantenimiento_relacionado', 'esta_vencida')
        }),
        ('Metadata', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def esta_vencida_display(self, obj):
        """Muestra si la alerta está vencida"""
        return "Sí" if obj.esta_vencida else "No"
    esta_vencida_display.short_description = 'Vencida'
    esta_vencida_display.boolean = True
