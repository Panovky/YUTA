from datetime import date
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


def get_age(birthday):
    today = date.today()
    age = today.year - birthday.year

    if today.month < birthday.month or today.month == birthday.month and today.day < birthday.day:
        age -= 1

    if age in (16, 17, 18):
        age = f'{age} лет'
    else:
        match age % 10:
            case 0 | 5 | 6 | 7 | 8 | 9:
                age = f'{age} лет'
            case 1:
                age = f'{age} год'
            case 2 | 3 | 4:
                age = f'{age} года'

    return age


def get_profile_statistic(user):
    all_projects_count = user.manager_projects.count() + len(
        [
            project
            for team in user.teams.all()
            for project in team.team_projects.all()
        ]
    )

    done_projects_count = user.manager_projects.filter(status='завершен').count() + len(
        [
            project
            for team in user.teams.all()
            for project in team.team_projects.filter(status='завершен')
        ]

    )

    all_tasks_count = user.responsible_tasks.count()
    done_tasks_count = user.responsible_tasks.filter(status='выполнена').count()

    teams_count = user.teams.count() + user.leader_teams.count()

    data = {
        'done_projects_count': done_projects_count,
        'all_projects_count': all_projects_count,
        'done_tasks_count': done_tasks_count,
        'all_tasks_count': all_tasks_count,
        'teams_count': teams_count,
    }

    return data
