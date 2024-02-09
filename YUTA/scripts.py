from PIL import Image
from bs4 import BeautifulSoup
from requests import Response
from users.models import Faculty, Direction, Group


def parse_lk(response: Response) -> dict:
    """
    Принимает ответ сервера на запрос авторизации на сайте ЯГТУ и возвращает словарь с данными о студенте из его ЛК.

    В функцию передается объект ответа сервера, только если авторизация прошла успешно. Для получения данных о студенте
    выполняется парсинг страницы его личного кабинета, которая как раз возвращается сервером при успешной авторизации.

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


def crop_photo(open_path: str, save_path: str, container_size: tuple[int, int], width: int, height: int, delta_x: int,
               delta_y: int) -> None:
    """
    Принимает путь к фотографии, обрезает ее согласно переданным параметрам и сохраняет ее по указанному пути.

    :param open_path: путь к фотографии, которую необходимо обрезать
    :type open_path: str
    :param save_path: путь, по которому нужно сохранить обрезанную фотографию
    :type save_path: str
    :param container_size: кортеж (c_width, c_height) с шириной и высотой контейнера, в котором лежит фотография
    :type container_size: tuple[int, int]
    :param width: ширина выбранной области фотографии
    :type width: int
    :param height: высота выбранной области фотографии
    :type height: int
    :param delta_x: смещение выбранной области от левого края фотографии
    :type delta_x: int
    :param delta_y: смещение выбранной области от верхнего края фотографии
    :type delta_y: int
    :rtype: None
    """
    photo = Image.open(open_path)
    coef = photo.size[0] / container_size[0]
    width = int(width * coef)
    height = int(height * coef)
    delta_x = int(delta_x * coef)
    delta_y = int(delta_y * coef)
    photo = photo.crop((delta_x, delta_y, delta_x + width, delta_y + height))
    photo.save(save_path)
