import requests
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View
from YUTA.scripts import parse_lk, crop_photo
from YUTA.settings import MEDIA_ROOT
from YUTA.utils import edit_user_data
from users.models import User


class ProfileView(View):
    def get(self, request, url_user_id):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=url_user_id)
        is_owner = url_user_id == session_user_id

        return render(
            request,
            'profile.html',
            context={
                'user': user,
                'is_owner': is_owner,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request, url_user_id):
        if not request.session.get('user_id'):
            return redirect('main')
        user = User.objects.get(id=url_user_id)

        action = request.POST.get('action')

        if action == 'update_photo':
            photo = request.FILES.get('photo')
            fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\images\\users_photos')

            photo_name = user.login
            if '.jpg' in photo.name:
                photo_name += '.jpg'
            elif '.jpeg' in photo.name:
                photo_name += '.jpeg'
            elif '.png' in photo.name:
                photo_name += '.png'

            fs.save(photo_name, photo)
            user.photo = f'images/users_photos/{photo_name}'

            fs.save('cropped-' + photo_name, photo)
            user.cropped_photo = f'images/users_photos/cropped-{photo_name}'

            user.save()
            return JsonResponse({'photo_url': user.photo.url})

        if action == 'update_miniature':
            photo_name = user.photo.url
            photo_name = photo_name.replace('/media/images/users_photos/', '')
            crop_photo(
                f'{MEDIA_ROOT}\\images\\users_photos\\{photo_name}',
                f'{MEDIA_ROOT}\\images\\users_photos\\cropped-{photo_name}',
                request.POST
            )

        if action == 'delete_photo':
            user.photo = 'images/default_user_photo.png'
            user.cropped_photo = 'images/cropped-default_user_photo.png'

        if action == 'edit_data':
            data = {
                'biography': request.POST.get('biography'),
                'phone_number': request.POST.get('phone_number'),
                'e_mail': request.POST.get('e_mail'),
                'vk': request.POST.get('vk')
            }

            edit_user_data(user, data)

        if action == 'update_data':
            login = user.login
            password = request.POST.get('password')
            response = requests.post('https://www.ystu.ru/WPROG/auth1.php',
                                     data={'login': login, 'password': password})

            if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
                session_user_id = request.session['user_id']
                is_owner = url_user_id == session_user_id

                return render(
                    request,
                    'profile.html',
                    context={
                        'user': user,
                        'is_owner': is_owner,
                        'message': 'Неправильный пароль.',
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

        return redirect('profile', url_user_id)
