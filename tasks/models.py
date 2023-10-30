from django.db import models
from projects.models import Project
from users.models import User

STATUS_CHOICES = (
    ('назначена', 'назначена'),
    ('в работе', 'в работе'),
    ('выполнена', 'выполнена')
)


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    creation_datetime = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=True)
    project = models.ForeignKey(Project, related_name='project_tasks', null=True, on_delete=models.SET_NULL)
    appointed = models.ForeignKey(User, related_name='appointed_tasks', null=True, on_delete=models.SET_NULL)
    responsible = models.ForeignKey(User, related_name='responsible_tasks', null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ["deadline"]

    def __str__(self):
        return f"Задача от {self.creation_datetime}"
