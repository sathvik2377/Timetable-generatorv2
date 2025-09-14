# Generated migration for NEP-2020 model extensions

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0001_initial'),
    ]

    operations = [
        # Update Institution model
        migrations.AlterField(
            model_name='institution',
            name='working_days',
            field=models.JSONField(
                default=lambda: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                help_text='List of working days (e.g., ["Mon","Tue","Wed","Thu","Fri"])'
            ),
        ),
        migrations.AddField(
            model_name='institution',
            name='max_teacher_hours_per_week',
            field=models.IntegerField(
                default=24,
                help_text='Maximum teaching hours per teacher per week (NEP-2020 compliant)',
                validators=[
                    django.core.validators.MinValueValidator(12),
                    django.core.validators.MaxValueValidator(40)
                ]
            ),
        ),
        
        # Update Subject model - add new subject types
        migrations.AlterField(
            model_name='subject',
            name='type',
            field=models.CharField(
                choices=[
                    ('theory', 'Theory'),
                    ('lab', 'Laboratory'),
                    ('project', 'Project Work'),
                    ('ability_enhancement', 'Ability Enhancement'),
                    ('core', 'Core Subject'),
                    ('elective', 'Elective Subject'),
                    ('skill', 'Skill Development')
                ],
                default='core',
                max_length=20
            ),
        ),
        
        # Add NEP-2020 specific fields to Subject
        migrations.AddField(
            model_name='subject',
            name='weekly_hours',
            field=models.IntegerField(
                default=3,
                help_text='Total weekly hours for this subject',
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(10)
                ]
            ),
        ),
        migrations.AddField(
            model_name='subject',
            name='minutes_per_slot',
            field=models.IntegerField(
                default=60,
                help_text='Duration of each class slot in minutes',
                validators=[
                    django.core.validators.MinValueValidator(30),
                    django.core.validators.MaxValueValidator(180)
                ]
            ),
        ),
        
        # Add M2M relationships to Teacher model
        migrations.AddField(
            model_name='teacher',
            name='subjects_taught',
            field=models.ManyToManyField(
                blank=True,
                help_text='Subjects this teacher is qualified to teach',
                related_name='qualified_teachers',
                to='timetable.subject'
            ),
        ),
        migrations.AddField(
            model_name='teacher',
            name='classes_assigned',
            field=models.ManyToManyField(
                blank=True,
                help_text='Branches/Classes this teacher is assigned to',
                related_name='assigned_teachers',
                to='timetable.branch'
            ),
        ),
    ]
