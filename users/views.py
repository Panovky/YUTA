import requests
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render, redirect
from django.views.generic import View
from YUTA.scripts import parse_lk, get_age
from YUTA.settings import MEDIA_ROOT
from users.models import User


class ProfileView(View):

    def get(self, request, url_user_id):
        if request.method == 'GET':
            user = User.objects.get(id=url_user_id)
            age = get_age(user.birthday)
            session_user_id = request.session['user_id']
            is_owner = url_user_id == session_user_id

            return render(
                request,
                'profile.html',
                context={
                    'photo_url': user.photo.url,
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
                    'vk': user.vk,
                    'is_owner': is_owner,
                    'menu_user_id': session_user_id
                }
            )

    def post(self, request, url_user_id):
        if request.method == 'POST':
            user = User.objects.get(id=url_user_id)

            if request.POST.get('action') == 'update_photo':
                photo = request.FILES['photo']
                fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\images\\users_photos')
                photo_name = fs.save(photo.name, photo)
                user.photo = f'images/users_photos/{photo_name}'

            if request.POST.get('action') == 'delete_photo':
                user.photo = 'images/default.png'

            if request.POST.get('action') == 'edit_data':

                if request.POST.get('biography'):
                    user.biography = request.POST.get('biography')
                else:
                    user.biography = None

                if request.POST.get('phone_number'):
                    user.phone_number = request.POST.get('phone_number')
                else:
                    user.phone_number = None

                if request.POST.get('e_mail'):
                    user.e_mail = request.POST.get('e_mail')
                else:
                    user.e_mail = None

                if request.POST.get('vk'):
                    user.vk = request.POST.get('vk')
                else:
                    user.vk = None

            if request.POST.get('action') == 'update_data':
                login = user.login
                password = request.POST.get('password')
                response = requests.post('https://www.ystu.ru/WPROG/auth1.php',
                                         data={'login': login, 'password': password})

                if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
                    message = 'неправильный пароль'
                    age = get_age(user.birthday)
                    session_user_id = request.session['user_id']
                    is_owner = url_user_id == session_user_id
                    return render(
                        request,
                        'profile.html',
                        context={
                            'photo_url': user.photo.url,
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
                            'vk': user.vk,
                            'is_owner': is_owner,
                            'message': message,
                            'menu_user_id': session_user_id
                        }
                    )

                if response.url == 'https://www.ystu.ru/WPROG/lk/lkstud.php':
                    data = parse_lk(response)
                    user.last_name = data.get('last_name')
                    user.first_name = data.get('first_name')
                    user.patronymic = data.get('patronymic')
                    user.birthday = data.get('birthday')
                    user.faculty = data.get('faculty')
                    user.direction = data.get('direction')
                    user.group = data.get('group')

            user.save()

            return redirect(f'/profile/{url_user_id}')
