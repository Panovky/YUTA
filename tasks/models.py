from django.db import models
from projects.models import Project
from users.models import User

PRIORITY_CHOICES = (
    ('срочно', 'срочно'),
    ('не срочно', 'не срочно')
)

STATUS_CHOICES = (
    ('назначена', 'назначена'),
    ('в процессе', 'в процессе'),
    ('выполнена', 'выполнена')
)


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    priority = models.CharField(choices=PRIORITY_CHOICES)
    status = models.CharField(choices=STATUS_CHOICES)
    creation_datetime = models.DateTimeField()
    deadline = models.DateTimeField()
    project_id = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)
    appointed = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='appointed_task_set')
    responsible = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='responsible_task_set')

    class Meta:
        ordering = ["deadline"]

    def __str__(self):
        return f"Задача от {self.creation_datetime}"
