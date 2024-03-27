import datetime
import json
import re
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from rest_framework.views import APIView
from YUTA.photo_cropper import crop_photo
from YUTA.settings import MEDIA_ROOT
from YUTA.utils import authorize_user, edit_user_data, update_user_data, search_users, get_team_info, \
    is_team_name_unique, get_project_info
from projects.models import Project
from teams.models import Team
from users.models import User


class AuthorizationView(APIView):
    def get(self, request):
        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })

    def post(self, request):
        if 'login' in request.data and 'password' in request.data and len(request.data) == 2:
            login = request.data['login']
            password = request.data['password']
            user = authorize_user(login, password)

            return JsonResponse({
                'status': 'OK' if user else 'failed',
                'error': None if user else 'invalid credentials',
                'user_id': user.id if user else None
            })

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })


class ProfileView(APIView):
    def get(self, request):
        if 'user_id' in request.query_params and len(request.query_params) == 1:
            user_id = request.query_params['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id',
                    'user': None
                })

            user = User.objects.get(id=user_id)

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'user':
                    {
                        'login': user.login,
                        'photo_url': user.photo.url,
                        'cropped_photo_url': user.cropped_photo.url,
                        'last_name': user.last_name,
                        'first_name': user.first_name,
                        'patronymic': user.patronymic,
                        'age': user.age,
                        'biography': user.biography,
                        'phone_number': user.phone_number,
                        'e_mail': user.e_mail,
                        'vk': user.vk,
                        'faculty': user.faculty.name,
                        'direction': f'{user.direction.code}-{user.direction.name}',
                        'group': user.group.name,
                        'all_projects_count': user.all_projects_count,
                        'done_projects_count': user.done_projects_count,
                        'all_tasks_count': user.done_tasks_count,
                        'done_tasks_count': user.done_tasks_count,
                        'teams_count': user.teams_count,
                    }
            })

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })

    def post(self, request):
        if 'user_id' in request.data and len(request.data) == 1:
            user_id = request.data['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id'
                })

            user = User.objects.get(id=user_id)
            user.photo = 'images/default_user_photo.png'
            user.cropped_photo = 'images/cropped-default_user_photo.png'
            user.save()

            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'user_id' in request.data and 'photo' in request.data and len(request.data) == 2:
            user_id = request.data['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id'
                })

            photo = request.data['photo']
            extension = photo.name.split('.')[-1]
            if extension not in ('jpg', 'jpeg', 'png'):
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid photo extension'
                })

            user = User.objects.get(id=user_id)
            photo_name = f'{user.login}.{extension}'
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

            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'user_id' in request.data and 'container_width' in request.data and 'container_height' in request.data \
                and 'width' in request.data and 'height' in request.data and 'delta_x' in request.data \
                and 'delta_y' in request.data and len(request.data) == 7:
            user_id = request.data['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id'
                })

            user = User.objects.get(id=user_id)
            photo_url = user.photo.url
            photo_name = photo_url.replace('/media/images/users_photos/', '')

            crop_photo(
                f'{MEDIA_ROOT}\\images\\users_photos\\{photo_name}',
                f'{MEDIA_ROOT}\\images\\users_photos\\cropped-{photo_name}',
                (int(request.data['container_width']), int(request.data['container_height'])),
                int(request.data['width']),
                int(request.data['height']),
                int(request.data['delta_x']),
                int(request.data['delta_y'])
            )

            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'user_id' in request.data and 'biography' in request.data and 'phone_number' in request.data and \
                'e_mail' in request.data and 'vk' in request.data and len(request.data) == 5:
            user_id = request.data['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id'
                })

            phone_number = request.data['phone_number']
            if phone_number.strip():
                pattern = r'\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}'
                if re.fullmatch(pattern, phone_number) is None:
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid phone number format'
                    })

            vk = request.data['vk']
            if vk.strip():
                pattern = r'https://vk\.com/'
                if re.match(pattern, vk) is None:
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid vk url format'
                    })

            data = {
                'biography': request.data['biography'],
                'phone_number': phone_number,
                'e_mail': request.data['e_mail'],
                'vk': vk
            }

            edit_user_data(User.objects.get(id=user_id), data)
            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'user_id' in request.data and 'password' in request.data and len(request.data) == 2:
            user_id = request.data['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id'
                })

            password = request.data['password']
            user = User.objects.get(id=user_id)
            success = update_user_data(user, password)
            return JsonResponse({
                'status': 'OK' if success else 'failed',
                'error': None if success else 'invalid credentials'
            })

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })


class ProjectsView(APIView):
    def get(self, request):
        if 'user_id' in request.query_params and len(request.query_params) == 1:
            user_id = request.query_params['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id',
                    'managed_projects': None,
                    'others_projects': None,
                })

            user = User.objects.get(id=user_id)
            managed_projects = user.manager_projects.all()
            others_projects = [project for team in user.teams.all() for project in team.team_projects.all()]

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'managed_projects': [project.serialize_for_projects_view() for project in managed_projects],
                'others_projects': [project.serialize_for_projects_view() for project in others_projects],
            })

        if 'project_id' in request.query_params and len(request.query_params) == 1:
            project_id = request.query_params['project_id']
            if not Project.objects.filter(id=project_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid project id',
                    'project': None
                })

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'project': get_project_info(project_id)
            })

        if 'team_name' in request.query_params and 'leader_id' in request.query_params:
            leader_id = request.query_params['leader_id']
            if not User.objects.filter(id=leader_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid leader id',
                    'teams': None
                })

            team_name = request.query_params['team_name'].strip()
            leader = User.objects.get(id=leader_id)
            teams = Team.objects.filter(name__icontains=team_name) & Team.objects.filter(leader=leader)

            if 'project_team_id' in request.query_params:
                project_team_id = request.query_params['project_team_id']
                if not Team.objects.filter(id=project_team_id):
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid project team id',
                        'teams': None
                    })
                teams = teams.exclude(id=project_team_id)

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'teams': [
                    {
                        'id': team.id,
                        'name': team.name,
                    }
                    for team in teams
                ]
            })

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })

    def post(self, request):
        if 'manager_id' in request.data and 'project_name' in request.data and 'project_description' in request.data \
                and 'project_deadline' in request.data:
            manager_id = request.data['manager_id']
            if not User.objects.filter(id=manager_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid manager id'
                })

            deadline = request.data['project_deadline']
            if datetime.datetime.strptime(deadline, '%Y-%m-%d').date() < datetime.date.today():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid deadline'
                })

            if 'project_team_id' in request.data:
                project_team_id = request.data['project_team_id']
                if not Team.objects.filter(id=project_team_id).exists():
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid project team id'
                    })
            else:
                project_team_id = None

            Project.objects.create_project(
                name=request.data['project_name'].strip(),
                description=request.data['project_description'].strip(),
                technical_task=request.data.get('project_technical_task'),
                deadline=deadline,
                manager_id=manager_id,
                team_id=project_team_id
            )

            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'project_id' in request.data and 'project_name' in request.data and 'project_description' in request.data \
                and 'project_deadline' in request.data and 'project_status' in request.data:
            project_id = request.data['project_id']
            if not Project.objects.filter(id=project_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid project id'
                })

            deadline = request.data['project_deadline']
            if datetime.datetime.strptime(deadline, '%Y-%m-%d').date() < datetime.date.today():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid deadline'
                })

            status = request.data['project_status']
            if status not in ('в работе', 'приостановлен', 'завершен'):
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid status'
                })

            if 'project_team_id' in request.data:
                project_team_id = request.data['project_team_id']
                if not Team.objects.filter(id=project_team_id).exists():
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid project team id'
                    })
                team = Team.objects.get(id=project_team_id)
            else:
                team = None

            project = Project.objects.get(id=project_id)
            name = request.data['project_name'].strip()
            description = request.data['project_description'].strip()

            if request.data.get('project_technical_task'):
                file = request.data['project_technical_task']
                file_name = f'technical_task_{project.id}.pdf'
                fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\projects_technical_tasks')

                if fs.exists(file_name):
                    fs.delete(file_name)

                fs.save(file_name, file)
                technical_task = f'projects_technical_tasks/{file_name}'
            else:
                technical_task = None

            project.name = name
            project.description = description
            project.technical_task = technical_task
            project.deadline = deadline
            project.status = status
            project.team = team
            project.save()

            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        if 'project_id' in request.data and len(request.data) == 1:
            project_id = request.data['project_id']
            if not Project.objects.filter(id=project_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid project id'
                })

            Project.objects.get(id=project_id).delete()
            return JsonResponse({
                'status': 'OK',
                'error': None
            })

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })


class TasksView(APIView):
    def get(self, request):
        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })

    def post(self, request):
        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })


class TeamsView(APIView):
    def get(self, request):
        if 'user_id' in request.query_params and len(request.query_params) == 1:
            user_id = request.query_params['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id',
                    'managed_teams': None,
                    'others_teams': None,
                })

            managed_teams = User.objects.get(id=user_id).leader_teams.all()
            others_teams = User.objects.get(id=user_id).teams.all()

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'managed_teams': [team.serialize_for_teams_view() for team in managed_teams],
                'others_teams': [team.serialize_for_teams_view() for team in others_teams],
            })

        if 'team_id' in request.query_params and len(request.query_params) == 1:
            team_id = request.query_params['team_id']
            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid team id',
                    'team': None
                })

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'team': get_team_info(team_id)
            })

        if 'team_name' in request.query_params and len(request.query_params) == 1:
            team_name = request.query_params['team_name'].strip()
            return JsonResponse({
                'status': 'OK',
                'error': None,
                'unique': is_team_name_unique(team_name)
            })

        if 'team_name' in request.query_params and 'team_id' in request.query_params and len(request.query_params) == 2:
            team_id = request.query_params['team_id']
            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid team id',
                    'unique': None
                })

            team_name = request.query_params['team_name'].strip()

            return JsonResponse({
                'status': 'OK',
                'error': None,
                'unique': is_team_name_unique(team_name, team_id)
            })

        if 'user_name' in request.query_params and 'leader_id' in request.query_params and \
                'members_id' in request.query_params and len(request.query_params) == 3:

            leader_id = request.query_params['leader_id']
            if not User.objects.filter(id=leader_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid user id',
                    'users': None
                })

            members_id = json.loads(request.query_params['members_id'])
            for member_id in members_id:
                if not User.objects.filter(id=member_id).exists():
                    return JsonResponse({
                        'status': 'failed',
                        'error': 'invalid member id',
                        'users': None
                    })

            user_name = request.query_params['user_name']
            return JsonResponse({'status': 'OK', 'error': None} | search_users(user_name, leader_id, members_id))

        return JsonResponse({
            'status': 'failed',
            'error': 'invalid request'
        })


def post(self, request):
    if 'leader_id' in request.data and 'team_name' in request.data and 'members_id' in request.data and \
            len(request.data) == 3:
        leader_id = request.data['leader_id']
        if not User.objects.filter(id=leader_id).exists():
            return JsonResponse({
                'status': 'failed',
                'error': 'invalid leader id'
            })

        team_name = request.data['team_name'].strip()
        if not is_team_name_unique(team_name):
            return JsonResponse({
                'status': 'failed',
                'error': 'non-unique team name'
            })

        members_id = request.data['members_id']
        for member_id in members_id:
            if not User.objects.filter(id=member_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid member id'
                })

        team = Team.objects.create(
            name=team_name,
            leader=User.objects.get(id=leader_id)
        )

        for member_id in members_id:
            member = User.objects.get(id=member_id)
            team.members.add(member)
            member.teams.add(team)

        return JsonResponse({
            'status': 'OK',
            'error': None
        })

    if 'team_id' in request.data and 'team_name' in request.data and 'members_id' in request.data and \
            len(request.data) == 3:
        team_id = request.data['team_id']
        if not Team.objects.filter(id=team_id).exists():
            return JsonResponse({
                'status': 'failed',
                'error': 'invalid team id'
            })

        team_name = request.data['team_name'].strip()
        if not is_team_name_unique(team_name, team_id):
            return JsonResponse({
                'status': 'failed',
                'error': 'non-unique team name'
            })

        members_id = request.data['members_id']
        for member_id in members_id:
            if not User.objects.filter(id=member_id).exists():
                return JsonResponse({
                    'status': 'failed',
                    'error': 'invalid member id'
                })

        team = Team.objects.get(id=team_id)
        team.name = team_name
        team.members.clear()

        for member_id in members_id:
            member = User.objects.get(id=member_id)
            team.members.add(member)
            member.teams.add(team)
        team.save()

        return JsonResponse({
            'status': 'OK',
            'error': None
        })

    if 'team_id' in request.data and len(request.data) == 1:
        team_id = request.data['team_id']

        if not Team.objects.filter(id=team_id).exists():
            return JsonResponse({
                'status': 'failed',
                'error': 'invalid team id'
            })

        Team.objects.get(id=team_id).delete()
        return JsonResponse({
            'status': 'OK',
            'error': None
        })

    return JsonResponse({
        'status': 'failed',
        'error': 'invalid request'
    })
