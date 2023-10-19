from datetime import date
from django.shortcuts import render
from django.views.generic import View
from users.models import User


class ProfileView(View):

    def get(self, request, user_id):
        if request.method == 'GET':
            user = User.objects.get(id=user_id)
            birthday = user.birthday
            today = date.today()
            age = today.year - birthday.year

            if today.month < birthday.month or today.month == birthday.month and today.day < birthday.day:
                age -= 1

            if age in (16, 17, 18):
                age = f'{age} лет'
            else:
                match age % 10:
                    case 0 | 5 | 6 | 7 | 8 | 9:
                        age = f'{age} лет'
                    case 1:
                        age = f'{age} год'
                    case 2 | 3 | 4:
                        age = f'{age} года'

            return render(
                request,
                'profile.html',
                context={
                    'photo': user.photo,
                    'last_name': user.last_name,
                    'first_name': user.first_name,
                    'patronymic': user.patronymic,
                    'age': age,
                    'biography': user.biography,
                    'faculty': user.faculty.name,
                    'direction': f'{user.direction.code} - {user.direction.name}',
                    'group': user.group.name,
                    'phone_number': user.phone_number,
                    'e_mail': user.e_mail,
                    'vk': user.vk
                }
            )
