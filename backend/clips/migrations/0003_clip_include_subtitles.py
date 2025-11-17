# Generated manually on 2025-11-16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clips', '0002_clip_subtitle_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='clip',
            name='include_subtitles',
            field=models.BooleanField(default=False),
        ),
    ]
