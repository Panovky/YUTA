import requests
from YUTA.scripts import parse_lk
from users.models import User


def authorize_user(login, password):
    response = requests.post('https://www.ystu.ru/WPROG/auth1.php', data={'login': login, 'password': password})

    if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
        return False

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

        return user


def edit_user_data(user, data):
    user.biography = data.get('biography').strip() if data.get('biography') else None
    user.phone_number = data.get('phone_number') if data.get('phone_number') else None
    user.e_mail = data.get('e_mail').strip() if data.get('e_mail') else None
    user.vk = data.get('vk').strip() if data.get('vk') else None
    user.save()


def update_user_data(user, password):
    login = user.login
    response = requests.post('https://www.ystu.ru/WPROG/auth1.php', data={'login': login, 'password': password})

    if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
        return False

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
        return True
