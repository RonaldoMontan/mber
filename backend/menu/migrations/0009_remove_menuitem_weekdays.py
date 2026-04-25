from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0008_menuitemschedule_daily_price'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='menuitem',
            name='weekdays',
        ),
    ]
