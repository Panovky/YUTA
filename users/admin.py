from django.contrib import admin
from users.models import User, Faculty, Group

admin.site.register(User)
admin.site.register(Faculty)
admin.site.register(Group)
