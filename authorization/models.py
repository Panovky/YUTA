from django.db import models
from users.models import User


class Account(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField()
    password = models.CharField()
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Аккаунт'
        verbose_name_plural = 'Аккаунты'
        ordering = ["login"]

    def __str__(self):
        return self.login
