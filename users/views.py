from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View
from YUTA.scripts import crop_photo
from YUTA.settings import MEDIA_ROOT
from YUTA.utils import edit_user_data, update_user_data
from users.models import User


class ProfileView(View):
    def get(self, request, url_user_id):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
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
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        user = User.objects.get(id=session_user_id)
        action = request.POST['action']

        if action == 'update_photo':
            photo = request.FILES['photo']
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
            photo_url = user.photo.url
            photo_name = photo_url.replace('/media/images/users_photos/', '')
            crop_photo(
                f'{MEDIA_ROOT}\\images\\users_photos\\{photo_name}',
                f'{MEDIA_ROOT}\\images\\users_photos\\cropped-{photo_name}',
                (int(request.POST['container_width']), int(request.POST['container_height'])),
                int(request.POST['width']),
                int(request.POST['height']),
                int(request.POST['delta_x']),
                int(request.POST['delta_y'])
            )
            return redirect('profile', session_user_id)

        if action == 'delete_photo':
            user.photo = 'images/default_user_photo.png'
            user.cropped_photo = 'images/cropped-default_user_photo.png'
            user.save()
            return redirect('profile', session_user_id)

        if action == 'edit_data':
            data = {
                'biography': request.POST['biography'],
                'phone_number': request.POST['phone_number'],
                'e_mail': request.POST['e_mail'],
                'vk': request.POST['vk']
            }
            edit_user_data(user, data)
            return redirect('profile', session_user_id)

        if action == 'update_data':
            password = request.POST['password']

            if not update_user_data(user, password):
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

            return redirect('profile', session_user_id)

