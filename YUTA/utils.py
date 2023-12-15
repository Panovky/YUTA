import io
import requests
from YUTA.scripts import parse_lk
from YUTA.settings import MEDIA_ROOT
from projects.models import Project
from teams.models import Team
from users.models import User


def authorize_user(login, password):
    response = requests.post('https://www.ystu.ru/WPROG/auth1.php', data={'login': login, 'password': password})

    if response.url == 'https://www.ystu.ru/WPROG/auth1.php':
        return None

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


def search_user(user_name, leader_id, members_id):
    user_name = [word.strip() for word in user_name.split()]

    if len(user_name) > 3:
        return {'users': []}

    if len(user_name) == 3:
        users = \
            User.objects.filter(last_name__istartswith=user_name[0]) & \
            User.objects.filter(first_name__istartswith=user_name[1]) & \
            User.objects.filter(patronymic__istartswith=user_name[2])
    elif len(user_name) == 2:
        users = \
            User.objects.filter(last_name__istartswith=user_name[0]) & \
            User.objects.filter(first_name__istartswith=user_name[1]) | \
            User.objects.filter(first_name__istartswith=user_name[0]) & \
            User.objects.filter(last_name__istartswith=user_name[1]) | \
            User.objects.filter(first_name__istartswith=user_name[0]) & \
            User.objects.filter(patronymic__istartswith=user_name[1])
    else:
        users = \
            User.objects.filter(last_name__istartswith=user_name[0]) | \
            User.objects.filter(first_name__istartswith=user_name[0]) | \
            User.objects.filter(patronymic__istartswith=user_name[0])

    prohibited_id = [leader_id] + [member_id for member_id in members_id]
    users = users.exclude(id__in=prohibited_id)

    return {
        'users': [
            {
                'id': user.id,
                'cropped_photo_url': user.cropped_photo.url,
                'last_name': user.last_name,
                'first_name': user.first_name,
                'patronymic': user.patronymic,
            }
            for user in users
        ]
    }


def get_team_info(team_id):
    team = Team.objects.get(id=team_id)

    return {
        'name': team.name,
        'members': [
            {
                'id': member.id,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'patronymic': member.patronymic,
                'cropped_photo_url': member.cropped_photo.url
            }
            for member in team.members.all()
        ]
    }


def get_project_info(project_id):
    project = Project.objects.get(id=project_id)

    if project.technical_task:
        technical_task_path = project.technical_task.url
        technical_task_name = technical_task_path.replace('/media/projects_technical_tasks/', '')
    else:
        technical_task_name = None

    return {
        'name': project.name,
        'technical_task_name': technical_task_name,
        'deadline': project.deadline,
        'status': project.status,
        'description': project.description,
        'team': {
            'id': project.team.id,
            'name': project.team.name
        } if project.team else None
    }
