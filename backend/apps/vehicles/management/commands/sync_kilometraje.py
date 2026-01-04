from django.core.management.base import BaseCommand
from django.db.models import Max
from apps.vehicles.models import Vehiculo
from apps.fuel_logs.models import CargaCombustible


class Command(BaseCommand):
    help = 'Sincroniza el kilometraje de los vehículos con su última carga'

    def handle(self, *args, **options):
        vehiculos = Vehiculo.objects.all()
        actualizados = 0

        self.stdout.write('Sincronizando kilometrajes...\n')

        for vehiculo in vehiculos:
            # Obtener el kilometraje máximo de las cargas
            max_km = CargaCombustible.objects.filter(
                vehiculo=vehiculo
            ).aggregate(Max('kilometraje'))['kilometraje__max']

            if max_km and max_km > vehiculo.kilometraje_actual:
                self.stdout.write(
                    f"  Vehículo {vehiculo.placa}: "
                    f"{vehiculo.kilometraje_actual} km → {max_km} km"
                )
                vehiculo.kilometraje_actual = max_km
                vehiculo.save(update_fields=['kilometraje_actual'])
                actualizados += 1

        if actualizados > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ {actualizados} vehículo(s) actualizado(s)'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    '\n✅ Todos los vehículos ya están sincronizados'
                )
            )
