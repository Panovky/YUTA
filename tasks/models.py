from django.db import models
from projects.models import Project
from users.models import User


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    priority = models.CharField(choices=['срочно', 'не срочно'])
    status = models.CharField(choices=['назначена', 'в процессе', 'выполнена'])
    creation_datetime = models.DateTimeField()
    deadline = models.DateTimeField()
    project_id = models.ForeignKey(Project, on_delete=models.SET_NULL)
    appointed = models.ForeignKey(User, on_delete=models.SET_NULL)
    responsible = models.ForeignKey(User, on_delete=models.SET_NULL)

    class Meta:
        ordering = ["deadline"]

    def __str__(self):
        return f"Задача от {self.creation_datetime}"
