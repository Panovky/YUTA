from django.http import JsonResponse
from rest_framework.views import APIView
from YUTA.utils import authorize_user, edit_user_data, update_user_data, search_user
from teams.models import Team
from users.models import User


class AuthorizationView(APIView):
    def post(self, request):
        login = request.data.get('login')
        password = request.data.get('password')
        user = authorize_user(login, password)
        response_data = {
            'status': 'OK' if user else 'Failed',
            'user_id': user.id if user else None
        }
        return JsonResponse(data=response_data)


class ProfileView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        user = User.objects.get(id=user_id)

        response_data = {
            'login': user.login,
            'photo': user.photo.url,
            'cropped_photo': user.cropped_photo.url,
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
        user_id = request.data.get('user_id')
        action = request.data.get('action')
        user = User.objects.get(id=user_id)

        if action == 'edit_data':
            data = {
                'biography': request.data.get('biography'),
                'phone_number': request.data.get('phone_number'),
                'e_mail': request.data.get('e_mail'),
                'vk': request.data.get('vk')
            }

            edit_user_data(user, data)
            return JsonResponse(data={'modified': True})

        if action == 'update_data':
            password = request.data.get('password')
            return JsonResponse(data={'success': update_user_data(user, password)})


class TeamsView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        managed_teams = User.objects.get(id=user_id).leader_teams.all()
        others_teams = User.objects.get(id=user_id).teams.all()

        response_data = {
            'managed_teams': [team.serialize_for_teams_view() for team in managed_teams],
            'others_teams': [team.serialize_for_teams_view() for team in others_teams],
        }

        return JsonResponse(data=response_data)

    def post(self, request):
        action = request.data.get('action')

        if action == 'delete_team':
            team_id = request.data.get('team_id')
            Team.objects.get(id=team_id).delete()
            return JsonResponse({'success': True})

        if action == 'check_team_name':
            new_team_name = request.data.get('team_name').strip()

            if request.data.get('team_id'):
                team_id = request.data.get('team_id')
                old_team_name = Team.objects.get(id=team_id).name
                if new_team_name == old_team_name:
                    return JsonResponse({
                        'unique': True}
                    )

            return JsonResponse({
                'unique': not Team.objects.filter(name=new_team_name).exists()
            })

        if action == 'search_user':
            user_name = request.data.get('user_name')
            leader_id = request.data.get('leader_id')
            members_id = request.data.get('members_id')
            return JsonResponse(data=search_user(user_name, leader_id, members_id))

        if action == 'create_team':
            team_name = request.data.get('team_name').strip()
            leader = User.objects.get(id=request.data.get('leader_id'))

            team = Team.objects.create(
                name=team_name,
                leader=leader
            )

            members_id = request.data.get('members_id')
            for member_id in members_id:
                team.members.add(User.objects.get(id=member_id))

            return JsonResponse({'success': True})

        if action == 'edit_team':
            team_id = request.data.get('team_id')
            team = Team.objects.get(id=team_id)

            team_name = request.data.get('team_name').strip()
            team.name = team_name

            team.members.clear()
            members_id = request.data.get('members_id')
            for member_id in members_id:
                team.members.add(User.objects.get(id=member_id))

            team.save()
            return JsonResponse({'success': True})

