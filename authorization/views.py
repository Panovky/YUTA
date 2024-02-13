from django.shortcuts import render, redirect
from django.views.generic.base import View
from YUTA.utils import authorize_user


class MainView(View):

    def get(self, request):
        request.session['user_id'] = None
        return render(request, 'main.html')

    def post(self, request):
        login = request.POST['login']
        password = request.POST['password']
        user = authorize_user(login, password)

        if user:
            request.session['user_id'] = user.id
            return redirect('tasks')

        return render(request, 'main.html', context={'message': 'Неправильный логин или пароль.'})

