# Generated by Django 4.2.6 on 2023-10-17 14:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_alter_direction_code_alter_direction_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='patronymic',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
