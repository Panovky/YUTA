from django.db import models


class Faculty(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()

    class Meta:
        verbose_name = 'Факультет'
        verbose_name_plural = 'Факультеты'
        ordering = ["name"]

    def __str__(self):
        return self.name


class Direction(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField()
    name = models.CharField()

    class Meta:
        verbose_name = 'Направление подготовки'
        verbose_name_plural = 'Направления подготовки'
        ordering = ["name"]

    def __str__(self):
        return f'{self.code} - {self.name}'


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()

    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField()
    last_name = models.CharField()
    first_name = models.CharField()
    patronymic = models.CharField(blank=True, null=True)
    birthday = models.DateField()
    biography = models.CharField(max_length=500, blank=True, null=True)
    faculty = models.ForeignKey(Faculty, null=True, on_delete=models.SET_NULL)
    direction = models.ForeignKey(Direction, null=True, on_delete=models.SET_NULL)
    group = models.ForeignKey(Group, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ["last_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.patronymic}"

