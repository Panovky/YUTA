from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View
from YUTA.scripts import crop_photo
from YUTA.settings import MEDIA_ROOT
from YUTA.utils import edit_user_data, update_user_data, search_users
from users.models import User


class ProfileView(View):
    def get(self, request, url_user_id):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        user = User.objects.get(id=url_user_id)
        is_owner = url_user_id == session_user_id
        is_default_photo = 'default_user_photo' in user.photo.url

        return render(
            request,
            'profile.html',
            context={
                'user': user,
                'is_owner': is_owner,
                'is_default_photo': is_default_photo,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request, url_user_id):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        user = User.objects.get(id=session_user_id)
        action = request.POST['action']

        if action == 'navbar_search_user':
            user_name = request.POST['navbar_user_name']
            return JsonResponse(data=search_users(user_name))

        if action == 'update_photo':
            photo = request.FILES['photo']
            photo_name = f'{user.login}.{photo.name.split(".")[-1]}'
            fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\images\\users_photos')

            if fs.exists(name := f'{user.login}.jpg') or fs.exists(name := f'{user.login}.jpeg') or \
                    fs.exists(name := f'{user.login}.png'):
                fs.delete(name)

            if fs.exists(name := f'cropped-{user.login}.jpg') or fs.exists(name := f'cropped-{user.login}.jpeg') or \
                    fs.exists(name := f'cropped-{user.login}.png'):
                fs.delete(name)

            fs.save(photo_name, photo)
            fs.save('cropped-' + photo_name, photo)
            user.photo = f'images/users_photos/{photo_name}'
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
                is_default_photo = 'default_user_photo' in user.photo.url

                return render(
                    request,
                    'profile.html',
                    context={
                        'user': user,
                        'is_owner': is_owner,
                        'is_default_photo': is_default_photo,
                        'message': 'Неправильный пароль.',
                        'menu_user_id': session_user_id
                    }
                )

            return redirect('profile', session_user_id)
