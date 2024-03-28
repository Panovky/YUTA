import datetime
import re
from django.core.files.storage import FileSystemStorage
from django.db import models
from YUTA.settings import MEDIA_ROOT
from users.models import User
from teams.models import Team
from transliterate import slugify


STATUS_CHOICES = (
    ('в работе', 'в работе'),
    ('приостановлен', 'приостановлен'),
    ('завершен', 'завершен')
)


class Project(models.Model):
    def get_photo_path(self, file_name):
        fs = FileSystemStorage()
        file_names = fs.listdir(path=f'{MEDIA_ROOT}\\images\\projects_photos')[1]

        extension = file_name[file_name.rfind('.') + 1:]
        slug = slugify(file_name.replace(f'.{extension}', ''), language_code='ru')
        file_name = f'{slug}.{extension}'

        if file_name not in file_names:
            return f'images/projects_photos/{file_name}'
        else:
            pattern = f'{slug}-\\d+\\.{extension}'
            same_file_names = [file_name for file_name in file_names if re.fullmatch(pattern, file_name)]
            if not same_file_names:
                return f'images/projects_photos/{slug}-1.{extension}'
            versions = [
                int(file_name.replace(f'{slug}-', '').replace(f'.{extension}', ''))
                for file_name in same_file_names
            ]
            return f'images/projects_photos/{slug}-{max(versions) + 1}.{extension}'

    def get_technical_task_path(self, file_name):
        fs = FileSystemStorage()
        file_names = fs.listdir(path=f'{MEDIA_ROOT}\\projects_technical_tasks\\')[1]

        extension = file_name[file_name.rfind('.') + 1:]
        slug = slugify(file_name.replace(f'.{extension}', ''), language_code='ru')
        file_name = f'{slug}.{extension}'

        if file_name not in file_names:
            return f'projects_technical_tasks/{file_name}'
        else:
            pattern = f'{slug}-\\d+\\.{extension}'
            same_file_names = [file_name for file_name in file_names if re.fullmatch(pattern, file_name)]
            if not same_file_names:
                return f'projects_technical_tasks/{slug}-1.{extension}'
            versions = [
                int(file_name.replace(f'{slug}-', '').replace(f'.{extension}', ''))
                for file_name in same_file_names
            ]
            return f'projects_technical_tasks/{slug}-{max(versions) + 1}.{extension}'

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    photo = models.ImageField(blank=True, upload_to=get_photo_path, default='images/project_default.png')
    description = models.CharField(max_length=150)
    technical_task = models.FileField(blank=True, null=True, upload_to=get_technical_task_path,)
    creation_date = models.DateField(auto_now_add=True)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='в работе')
    manager = models.ForeignKey(User, related_name='manager_projects', null=True, on_delete=models.SET_NULL)
    team = models.ForeignKey(Team, related_name='team_projects', blank=True, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def deadline_str(self):
        if self.status == 'приостановлен':
            return 'Разработка проекта приостановлена'
        if self.status == 'завершен':
            return 'Проект успешно завершен'

        deadline = self.deadline
        today = datetime.date.today()
        days = (deadline - today).days

        if days < 0:
            return 'Сдача проекта просрочена'
        elif days == 0:
            return 'Срок сдачи проекта: сегодня'
        else:
            return f'Дней до сдачи проекта: {days}'

    def serialize_for_projects_view(self):
        return {
            'id': self.id,
            'photo_url': self.photo.url,
            'name': self.name,
            'technical_task_url': self.technical_task.url if self.technical_task else None,
            'status': self.status,
            'string_deadline': self.deadline_str,
            'description': self.description,
            'manager': {
                'id': self.manager.id,
                'cropped_photo_url': self.manager.cropped_photo.url,
                'last_name': self.manager.last_name,
                'first_name': self.manager.first_name,
            },
            'team': self.team.serialize_for_teams_view() if self.team else None
        }

