from django.db import models


class Faculty(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name = 'Факультет'
        verbose_name_plural = 'Факультеты'
        ordering = ["name"]

    def __str__(self):
        return self.name


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(models.Model):
    id = models.AutoField(primary_key=True)
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    patronymic = models.CharField(max_length=50, blank=True, null=True)
    birthday = models.DateField()
    biography = models.CharField(max_length=500)
    projects_num = models.IntegerField()
    tasks_num = models.IntegerField()
    faculty = models.ForeignKey(Faculty, null=True, on_delete=models.SET_NULL)
    group = models.ForeignKey(Group, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ["last_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.patronymic}"

