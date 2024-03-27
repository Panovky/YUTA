from bs4 import BeautifulSoup
from requests import Response
from users.models import Faculty, Direction, Group


def parse_lk(response: Response) -> dict:
    """
    Принимает ответ сервера на запрос авторизации на сайте ЯГТУ и возвращает словарь с данными о студенте из его ЛК.

    Для получения данных о студенте выполняется парсинг страницы его личного кабинета.

    :param response: объект ответа сервера на запрос авторизации пользователя на сайте ЯГТУ
    :type response: Response
    :return: словарь с информацией о студенте (ФИО, дата рождения, факультет, направление, группа)
    :rtype: dict
    """
    response.encoding = 'windows-1251'
    html_text = BeautifulSoup(response.text, 'html.parser')

    fio = html_text.find('h1').text.strip().split()
    last_name, first_name = fio[0], fio[1]
    patronymic = fio[2] if len(fio) == 3 else None

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

    return {
        'last_name': last_name,
        'first_name': first_name,
        'patronymic': patronymic,
        'birthday': birthday,
        'faculty': faculty,
        'direction': direction,
        'group': group
    }