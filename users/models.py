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


class Direction(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name = 'Направление подготовки'
        verbose_name_plural = 'Направления подготовки'
        ordering = ["name"]

    def __str__(self):
        return f'{self.code} - {self.name}'


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
    photo = models.ImageField(blank=True, null=True, upload_to='images/users_photos', default='images/default.png')
    login = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    patronymic = models.CharField(max_length=50, blank=True, null=True)
    birthday = models.DateField()
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    e_mail = models.CharField(max_length=50, blank=True, null=True)
    vk = models.CharField(max_length=50, blank=True, null=True)
    biography = models.CharField(max_length=200, blank=True, null=True)
    faculty = models.ForeignKey(Faculty, null=True, on_delete=models.SET_NULL)
    direction = models.ForeignKey(Direction, null=True, on_delete=models.SET_NULL)
    group = models.ForeignKey(Group, null=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ["last_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.patronymic if self.patronymic is not None else ''}"

