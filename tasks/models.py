from django.db import models
from projects.models import Project
from users.models import User

STATUS_CHOICES = (
    ('сделать', 'сделать'),
    ('в работе', 'в работе'),
    ('на проверке', 'на проверке'),
    ('готово', 'готово'),
    ('на стопе', 'на стопе')
)


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    deadline = models.DateField()
    appointed = models.ForeignKey(User, related_name='appointed_tasks', null=True, on_delete=models.SET_NULL)
    responsible = models.ForeignKey(User, related_name='responsible_tasks', null=True, on_delete=models.SET_NULL)
    project = models.ForeignKey(Project, related_name='project_tasks', null=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    completed = models.DateField(blank=True, null=True)
    archived = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['deadline']

    def __str__(self):
        return f"{self.project.name}: задача до {self.deadline}"

    @property
    def deadline_str(self):
        months = {
            1: 'января',
            2: 'февраля',
            3: 'марта',
            4: 'апреля',
            5: 'мая',
            6: 'июня',
            7: 'июля',
            8: 'августа',
            9: 'сентября',
            10: 'октября',
            11: 'ноября',
            12: 'декабря'
        }

        return f'{self.deadline.day} {months[self.deadline.month]} {self.deadline.year % 100} г.'
