# Generated by Django 3.2 on 2025-01-23 09:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='content',
            name='price',
            field=models.FloatField(default=400),
            preserve_default=False,
        ),
    ]
