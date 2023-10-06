from django.contrib.postgres.fields import ArrayField
from django.db import models
from users.models import User


class Team(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    leader = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    team_id = models.ForeignKey(Team, null=True, on_delete=models.SET_NULL)
