from django.db import models
from users.models import User
from teams.models import Team
import datetime


class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    photo = models.ImageField(blank=True, upload_to='images/projects_photos', default='images/default.png')
    description = models.CharField(max_length=200)
    technical_task = models.FileField(blank=True, null=True)
    creation_date = models.DateField(auto_now_add=True)
    deadline = models.DateField()
    manager = models.ForeignKey(User, related_name='manager_projects', null=True, on_delete=models.SET_NULL)
    team = models.ForeignKey(Team, related_name='team_projects', null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_deadline(self):
        deadline = self.deadline
        today = datetime.date.today()
        days = (deadline - today).days

        if days < 0:
            return 'сдача проекта просрочена'
        elif days == 0:
            return 'срок сдачи проекта: сегодня'
        else:
            return f'дней до сдачи проекта: {days}'



