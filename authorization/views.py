from django.shortcuts import render, redirect
from django.views.generic.base import View
import requests
from YUTA.scripts import parse_lk
from users.models import User


class MainView(View):

    def get(self, request):
        request.session['user_id'] = None
        return render(request, 'main.html')

    def post(self, request):
        login = request.POST.get('login')
        password = request.POST.get('password')
        response = requests.post('https://www.ystu.ru/WPROG/auth1.php', data={'login': login, 'password': password})

        if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
            return render(request, 'main.html', context={'message': 'Неправильный логин или пароль.'})

        if response.url == 'https://www.ystu.ru/WPROG/lk/lkstud.php':
            if User.objects.filter(login=login).exists():
                user = User.objects.get(login=login)
            else:
                data = parse_lk(response)
                user = User.objects.create(
                    login=login,
                    last_name=data.get('last_name'),
                    first_name=data.get('first_name'),
                    patronymic=data.get('patronymic'),
                    birthday=data.get('birthday'),
                    faculty=data.get('faculty'),
                    direction=data.get('direction'),
                    group=data.get('group')
                )

            request.session['user_id'] = user.id
            return redirect('tasks')
