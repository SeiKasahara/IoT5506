# Generated by Django 5.1.1 on 2024-10-02 08:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_alter_threshold_gas_concentration_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='sensordata',
            name='last_alert_sent',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
