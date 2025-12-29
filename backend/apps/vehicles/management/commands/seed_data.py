from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from apps.vehicles.models import Vehiculo
from apps.fuel_logs.models import CargaCombustible
from apps.maintenance.models import Mantenimiento, AlertaMantenimiento


class Command(BaseCommand):
    help = 'Carga datos de prueba para KmTracker (Ecuador)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando carga de datos de prueba...')

        # Crear usuario de prueba
        user, created = User.objects.get_or_create(
            username='usuario_demo',
            defaults={
                'email': 'demo@kmtracker.ec',
                'first_name': 'Juan',
                'last_name': 'Pérez'
            }
        )
        if created:
            user.set_password('demo123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Usuario creado: {user.username}'))

        # Crear vehículos ecuatorianos
        vehiculos_data = [
            {
                'marca': 'Chevrolet',
                'modelo': 'Sail',
                'año': 2020,
                'placa': 'GYE-1234',
                'tipo': 'AUTO',
                'kilometraje_actual': 45000,
                'capacidad_tanque': Decimal('50.00'),
                'color': 'Blanco'
            },
            {
                'marca': 'Toyota',
                'modelo': 'Hilux',
                'año': 2019,
                'placa': 'UIO-5678',
                'tipo': 'CAMION',
                'kilometraje_actual': 72000,
                'capacidad_tanque': Decimal('80.00'),
                'color': 'Gris'
            },
            {
                'marca': 'KIA',
                'modelo': 'Sportage',
                'año': 2021,
                'placa': 'CUE-9012',
                'tipo': 'SUV',
                'kilometraje_actual': 28000,
                'capacidad_tanque': Decimal('62.00'),
                'color': 'Rojo'
            },
            {
                'marca': 'Nissan',
                'modelo': 'Versa',
                'año': 2018,
                'placa': 'LJA-3456',
                'tipo': 'AUTO',
                'kilometraje_actual': 95000,
                'capacidad_tanque': Decimal('41.00'),
                'color': 'Negro'
            }
        ]

        vehiculos = []
        for v_data in vehiculos_data:
            vehiculo, created = Vehiculo.objects.get_or_create(
                placa=v_data['placa'],
                defaults={**v_data, 'usuario': user}
            )
            vehiculos.append(vehiculo)
            if created:
                self.stdout.write(f'  Vehiculo creado: {vehiculo}')

        # Crear cargas de combustible
        gasolineras = ['Primax', 'Petro Ecuador', 'Mobil', 'Terpel']
        tipos_combustible = ['EXTRA', 'SUPER', 'ECOPAIS', 'DIESEL']

        cargas_count = 0
        for i, vehiculo in enumerate(vehiculos):
            # 3-5 cargas por vehículo
            num_cargas = 3 + (i % 3)
            km_base = vehiculo.kilometraje_actual - (num_cargas * 400)

            for j in range(num_cargas):
                fecha = timezone.now() - timedelta(days=(num_cargas - j) * 10)
                km = km_base + (j * 400)
                litros = Decimal(str(30 + (j * 5)))
                precio_litro = Decimal('2.55') if j % 2 == 0 else Decimal('2.85')

                carga = CargaCombustible.objects.create(
                    vehiculo=vehiculo,
                    fecha=fecha,
                    kilometraje=km,
                    litros=litros,
                    precio_litro=precio_litro,
                    costo_total=litros * precio_litro,
                    tipo_combustible=tipos_combustible[i % 4],
                    estacion_servicio=gasolineras[j % 4],
                    tanque_lleno=j % 2 == 0
                )
                cargas_count += 1

        self.stdout.write(self.style.SUCCESS(f'  {cargas_count} cargas de combustible creadas'))

        # Crear mantenimientos
        talleres = ['AutoExpress Guayaquil', 'Toyocosta', 'Chevrocentro Quito', 'Mecánica Ramírez']
        tipos_mant = ['PREVENTIVO', 'CORRECTIVO']
        categorias = ['MOTOR', 'FRENOS', 'SUSPENSION', 'NEUMATICOS', 'ELECTRICO']

        mantenimientos_count = 0
        for i, vehiculo in enumerate(vehiculos):
            num_mant = 2 + (i % 2)

            for j in range(num_mant):
                fecha = timezone.now() - timedelta(days=(num_mant - j) * 20)
                km = vehiculo.kilometraje_actual - ((num_mant - j) * 500)

                mant = Mantenimiento.objects.create(
                    vehiculo=vehiculo,
                    fecha=fecha,
                    tipo=tipos_mant[j % 2],
                    categoria=categorias[j % 5],
                    descripcion=f'Mantenimiento {categorias[j % 5].lower()} - {tipos_mant[j % 2].lower()}',
                    kilometraje=km,
                    costo=Decimal(str(100 + (j * 50))),
                    taller=talleres[i % 4],
                    repuestos_utilizados='Filtro de aceite, aceite sintético 5W30' if j == 0 else 'Pastillas de freno',
                    proximo_mantenimiento_km=km + 5000,
                    proximo_mantenimiento_fecha=(timezone.now() + timedelta(days=90)).date(),
                    completado=True
                )
                mantenimientos_count += 1

        self.stdout.write(self.style.SUCCESS(f'  {mantenimientos_count} mantenimientos creados'))

        # Crear alertas de mantenimiento
        alertas_count = 0
        prioridades = ['MEDIA', 'ALTA', 'URGENTE']

        for i, vehiculo in enumerate(vehiculos):
            # 1-2 alertas por vehículo
            AlertaMantenimiento.objects.create(
                vehiculo=vehiculo,
                titulo='Cambio de aceite próximo',
                descripcion='Recordatorio para cambio de aceite y filtros',
                kilometraje_objetivo=vehiculo.kilometraje_actual + 5000,
                prioridad=prioridades[i % 3],
                activa=True
            )
            alertas_count += 1

            if i % 2 == 0:
                AlertaMantenimiento.objects.create(
                    vehiculo=vehiculo,
                    titulo='Revisión técnica vehicular',
                    descripcion='Revisión técnica anual obligatoria',
                    fecha_objetivo=(timezone.now() + timedelta(days=60)).date(),
                    prioridad='ALTA',
                    activa=True
                )
                alertas_count += 1

        self.stdout.write(self.style.SUCCESS(f'  {alertas_count} alertas creadas'))

        self.stdout.write(self.style.SUCCESS('\nCarga de datos completada exitosamente!'))
        self.stdout.write(f'   - Usuarios: 1')
        self.stdout.write(f'   - Vehiculos: {len(vehiculos)}')
        self.stdout.write(f'   - Cargas: {cargas_count}')
        self.stdout.write(f'   - Mantenimientos: {mantenimientos_count}')
        self.stdout.write(f'   - Alertas: {alertas_count}')
