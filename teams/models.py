from django.db import models
from users.models import User


class Team(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    leader = models.ForeignKey(User, related_name='leader_teams', null=True, on_delete=models.SET_NULL)
    members = models.ManyToManyField(User)

    class Meta:
        verbose_name = 'Команда'
        verbose_name_plural = 'Команды'
        ordering = ["name"]

    def __str__(self):
        return self.name

    def serialize_for_teams_view(self):
        return {
            'id': self.id,
            'name': self.name,
            'leader': {
                'id': self.leader.id,
                'cropped_photo': self.leader.cropped_photo.url,
                'last_name': self.leader.last_name,
                'first_name': self.leader.first_name,
            },
            'members': [
                {
                    'id': member.id,
                    'cropped_photo': member.cropped_photo.url,
                    'last_name': member.last_name,
                    'first_name': member.first_name,
                }
                for member in self.members.all()
            ],
        }
