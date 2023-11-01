from PIL import Image
from bs4 import BeautifulSoup
from users.models import Faculty, Direction, Group


def parse_lk(response):
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

    data = {
        'last_name': last_name,
        'first_name': first_name,
        'patronymic': patronymic,
        'birthday': birthday,
        'faculty': faculty,
        'direction': direction,
        'group': group
    }

    return data


def crop_photo(open_photo_path, save_photo_path, post_data):
    width = int(post_data.get('width'))
    height = int(post_data.get('height'))
    delta_x = int(post_data.get('delta_x'))
    delta_y = int(post_data.get('delta_y'))
    photo = Image.open(open_photo_path)
    photo = photo.crop((delta_x, delta_y, delta_x + width, delta_y + height))
    photo.save(save_photo_path)
