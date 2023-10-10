from django.db import models
from users.models import User
from teams.models import Team


class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    technical_task = models.FileField(blank=True, null=True)
    creation_date = models.DateField(auto_now_add=True)
    deadline = models.DateField()
    manager = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    team = models.ForeignKey(Team, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ["name"]

    def __str__(self):
        return self.name


class Column(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class ProjectColumn(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)
    column = models.ForeignKey(Column, null=True, on_delete=models.SET_NULL)
