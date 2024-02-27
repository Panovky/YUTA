import json
from django.http import JsonResponse
from rest_framework.views import APIView
from YUTA.utils import authorize_user, edit_user_data, update_user_data, search_users, get_team_info, \
    is_team_name_unique
from teams.models import Team
from users.models import User


class AuthorizationView(APIView):
    def post(self, request):
        login = request.data['login']
        password = request.data['password']
        user = authorize_user(login, password)
        response_data = {
            'status': 'OK' if user else 'Failed',
            'user_id': user.id if user else None
        }
        return JsonResponse(data=response_data)


class ProfileView(APIView):
    def get(self, request):
        user_id = request.query_params['user_id']
        user = User.objects.get(id=user_id)

        response_data = {
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

        return JsonResponse(data=response_data)

    def post(self, request):
        user_id = request.data['user_id']
        action = request.data['action']
        user = User.objects.get(id=user_id)

        if action == 'edit_data':
            data = {
                'biography': request.data['biography'],
                'phone_number': request.data['phone_number'],
                'e_mail': request.data['e_mail'],
                'vk': request.data['vk']
            }

            edit_user_data(user, data)
            return JsonResponse(data={'modified': True})

        if action == 'update_data':
            password = request.data['password']
            return JsonResponse(data={'success': update_user_data(user, password)})


class ProjectsView(APIView):
    def get(self, request):
        if request.query_params.get('user_id'):
            user_id = request.query_params['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'Failed',
                    'managed_projects': None,
                    'others_projects': None,
                })

            user = User.objects.get(id=user_id)
            managed_projects = user.manager_projects.all()
            others_projects = [project for team in user.teams.all() for project in team.team_projects.all()]

            return JsonResponse({
                'status': 'OK',
                'managed_projects': [project.serialize_for_projects_view() for project in managed_projects],
                'others_projects': [project.serialize_for_projects_view() for project in others_projects],
            })

    def post(self, request):
        pass


class TasksView(APIView):
    def get(self, request):
        pass

    def post(self, request):
        pass


class TeamsView(APIView):
    def get(self, request):
        if request.query_params.get('user_id'):
            user_id = request.query_params['user_id']
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({
                    'status': 'Failed',
                    'managed_teams': None,
                    'others_teams': None,
                })

            managed_teams = User.objects.get(id=user_id).leader_teams.all()
            others_teams = User.objects.get(id=user_id).teams.all()

            return JsonResponse({
                'status': 'OK',
                'managed_teams': [team.serialize_for_teams_view() for team in managed_teams],
                'others_teams': [team.serialize_for_teams_view() for team in others_teams],
            })

        if request.query_params.get('team_name'):
            team_name = request.query_params['team_name'].strip()

            if request.query_params.get('team_id'):
                team_id = request.query_params['team_id']
                if not Team.objects.filter(id=team_id).exists():
                    return JsonResponse({
                        'status': 'Failed',
                        'unique': None
                    })

                return JsonResponse({
                    'status': 'OK',
                    'unique': is_team_name_unique(team_name, team_id)
                })

            return JsonResponse({
                'status': 'OK',
                'unique': is_team_name_unique(team_name)
            })

        if request.query_params.get('team_id'):
            team_id = request.query_params['team_id']
            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({
                    'status': 'Failed',
                    'team': None
                })
            return JsonResponse({
                'status': 'OK',
                'team': get_team_info(team_id)
            })

        if request.query_params.get('user_name') and request.query_params.get('leader_id') and \
                request.query_params.get('members_id'):

            leader_id = request.query_params['leader_id']
            if not User.objects.filter(id=leader_id).exists():
                return JsonResponse({
                    'status': 'Failed',
                    'users': None
                })

            members_id = json.loads(request.query_params['members_id'])
            for member_id in members_id:
                if not User.objects.filter(id=member_id).exists():
                    return JsonResponse({
                        'status': 'Failed',
                        'users': None
                    })

            user_name = request.query_params['user_name']
            return JsonResponse({'status': 'OK'} | search_users(user_name, leader_id, members_id))

    def post(self, request):
        action = request.data['action']

        if action == 'delete_team':
            team_id = request.data['team_id']

            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({'success': False})

            Team.objects.get(id=team_id).delete()
            return JsonResponse({'success': True})

        if action == 'create_team':
            leader_id = request.data['leader_id']
            if not User.objects.filter(id=leader_id).exists():
                return JsonResponse({'success': False})

            team_name = request.data['team_name'].strip()
            if not is_team_name_unique(team_name):
                return JsonResponse({'success': False})

            members_id = request.data['members_id']
            for member_id in members_id:
                if not User.objects.filter(id=member_id).exists():
                    return JsonResponse({'success': False})

            team = Team.objects.create(
                name=team_name,
                leader=User.objects.get(id=leader_id)
            )

            for member_id in members_id:
                member = User.objects.get(id=member_id)
                team.members.add(member)
                member.teams.add(team)

            return JsonResponse({'success': True})

        if action == 'edit_team':
            team_id = request.data['team_id']
            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({'success': False})

            team_name = request.data['team_name'].strip()
            if not is_team_name_unique(team_name, team_id):
                return JsonResponse({'success': False})

            members_id = request.data['members_id']
            for member_id in members_id:
                if not User.objects.filter(id=member_id).exists():
                    return JsonResponse({'success': False})

            team = Team.objects.get(id=team_id)
            team.name = team_name
            team.members.clear()

            for member_id in members_id:
                member = User.objects.get(id=member_id)
                team.members.add(member)
                member.teams.add(team)

            team.save()
            return JsonResponse({'success': True})


