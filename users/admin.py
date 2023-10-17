from django.contrib import admin
from users.models import User, Faculty, Direction, Group

admin.site.register(User)
admin.site.register(Faculty)
admin.site.register(Direction)
admin.site.register(Group)
