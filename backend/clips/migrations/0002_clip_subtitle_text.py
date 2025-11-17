# Generated manually on 2025-11-16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clips', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='clip',
            name='subtitle_text',
            field=models.TextField(blank=True),
        ),
    ]
