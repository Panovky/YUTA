from django.db import models
from users.models import User
from teams.models import Team


class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    technical_task = models.FileField(blank=True)
    creation_date = models.DateField()
    deadline = models.DateField()
    manager_id = models.ForeignKey(User, on_delete=models.SET_NULL)
    team_id = models.ForeignKey(Team, on_delete=models.SET_NULL)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


