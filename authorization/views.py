from django.shortcuts import render, redirect
from django.views.generic.base import View
import requests
from bs4 import BeautifulSoup
from users.models import User, Faculty, Group, Direction


class MainView(View):

    def get(self, request):
        if request.method == 'GET':
            return render(request, 'main.html')

    def post(self, request):
        if request.method == 'POST':
            login = request.POST.get('login')
            password = request.POST.get('password')
            response = requests.post('https://www.ystu.ru/WPROG/auth1.php', data={'login': login, 'password': password})

            if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
                message = 'неправильный логин или пароль'
                return render(request, 'main.html', context={'message': message})

            if response.url == 'https://www.ystu.ru/WPROG/lk/lkstud.php':
                if User.objects.filter(login=login).exists():
                    user = User.objects.get(login=login)
                else:
                    response.encoding = 'windows-1251'
                    html_text = BeautifulSoup(response.text, 'html.parser')

                    fio = html_text.find('h1').text.strip().split()
                    last_name = fio[0]
                    first_name = fio[1]
                    if len(fio) == 3:
                        patronymic = fio[2]
                    else:
                        patronymic = None

                    faculty_name = html_text.find_all('table')[1].find_all('tr')[2].find_all('td')[1].text.strip()
                    if Faculty.objects.filter(name=faculty_name).exists():
                        faculty = Faculty.objects.get(name=faculty_name)
                    else:
                        faculty = Faculty.objects.create(name=faculty_name)

                    direction_full = html_text.find_all('table')[1].find_all('tr')[4].find_all('td')[1].text.strip()
                    direction_code, direction_name = direction_full.split('-')
                    if Direction.objects.filter(code=direction_code).exists():
                        direction = Direction.objects.get(code=direction_code)
                    else:
                        direction = Direction.objects.create(name=direction_name, code=direction_code)

                    group_name = html_text.find_all('table')[1].find_all('tr')[3].find_all('td')[1].text.strip()
                    if Group.objects.filter(name=group_name).exists():
                        group = Group.objects.get(name=group_name)
                    else:
                        group = Group.objects.create(name=group_name)

                    birthday = html_text.find_all('table')[3].find_all('tr')[3].find('td').text.strip()
                    birthday = birthday.split('.')
                    birthday.reverse()
                    birthday = '-'.join(birthday)

                    user = User.objects.create(
                        login=login,
                        last_name=last_name,
                        first_name=first_name,
                        patronymic=patronymic,
                        birthday=birthday,
                        faculty=faculty,
                        direction=direction,
                        group=group
                    )

                request.session['user_id'] = user.id

                return redirect('tasks')




