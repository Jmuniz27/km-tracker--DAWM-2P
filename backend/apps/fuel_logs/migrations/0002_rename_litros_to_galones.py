# Generated manually for field renaming

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('fuel_logs', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='cargacombustible',
            old_name='litros',
            new_name='galones',
        ),
        migrations.RenameField(
            model_name='cargacombustible',
            old_name='precio_litro',
            new_name='precio_galon',
        ),
    ]
