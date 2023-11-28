import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from teams.models import Team
from users.models import User


class TeamsView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=session_user_id)
        managed_teams = user.leader_teams.all()
        others_teams = user.teams.all()

        return render(
            request,
            'teams.html',
            context={
                'managed_teams': managed_teams,
                'others_teams': others_teams,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')

        if request.POST.get('action') == 'delete_team':
            team_id = request.POST.get('team_id')
            Team.objects.get(id=team_id).delete()
            return redirect('teams')

        if request.POST.get('action') == 'check_team_name':
            new_team_name = request.POST.get('team_name').strip()

            if request.POST.get('team_id'):
                team_id = request.POST.get('team_id')
                old_team_name = Team.objects.get(id=team_id).name
                if new_team_name == old_team_name:
                    return JsonResponse({
                        'unique': True}
                    )

            return JsonResponse({
                'unique': not Team.objects.filter(name=new_team_name).exists()
            })

        if request.POST.get('action') == 'search_user':
            user_name = request.POST.get('user_name').strip().split()
            members_id = json.loads(request.POST.get('members_id'))

            if len(user_name) == 3:
                users = \
                    User.objects.filter(last_name__icontains=user_name[0]) & \
                    User.objects.filter(first_name__icontains=user_name[1]) & \
                    User.objects.filter(patronymic__icontains=user_name[2])
            elif len(user_name) == 2:
                users = \
                    User.objects.filter(last_name__icontains=user_name[0]) & \
                    User.objects.filter(first_name__icontains=user_name[1]) | \
                    User.objects.filter(first_name__icontains=user_name[0]) & \
                    User.objects.filter(last_name__icontains=user_name[1]) | \
                    User.objects.filter(first_name__icontains=user_name[0]) & \
                    User.objects.filter(patronymic__icontains=user_name[1])
            else:
                users = \
                    User.objects.filter(last_name__icontains=user_name[0]) | \
                    User.objects.filter(first_name__icontains=user_name[0]) | \
                    User.objects.filter(patronymic__icontains=user_name[0])

            prohibited_id = [session_user_id] + [member_id for member_id in members_id]
            users = users.exclude(id__in=prohibited_id)

            response_data = {
                'users': [
                    {
                        'id': user.id,
                        'photo': user.cropped_photo.url,
                        'last_name': user.last_name,
                        'first_name': user.first_name,
                        'patronymic': user.patronymic,
                    }
                    for user in users
                ]
            }
            return JsonResponse(data=response_data)

        if request.POST.get('action') == 'create_team':
            team_name = request.POST.get('team_name').strip()
            team_leader = User.objects.get(id=request.session.get('user_id'))
            team_members_id = json.loads(request.POST.get('members_id'))

            team = Team.objects.create(
                name=team_name,
                leader=team_leader
            )

            for member_id in team_members_id:
                team.members.add(User.objects.get(id=member_id))

        if request.POST.get('action') == 'edit_team':
            team_id = request.POST.get('team_id')
            team_name = request.POST.get('team_name').strip()
            team_members_id = json.loads(request.POST.get('members_id'))

            team = Team.objects.get(id=team_id)
            team.name = team_name

            team.members.clear()
            for member_id in team_members_id:
                team.members.add(User.objects.get(id=member_id))

            team.save()

        if request.POST.get('action') == 'get_team_info':
            team_id = request.POST.get('team_id')
            team = Team.objects.get(id=team_id)

            response_data = {
                'name': team.name,
                'members': [
                    {
                        'id': member.id,
                        'first_name': member.first_name,
                        'last_name': member.last_name,
                        'patronymic': member.patronymic if member.patronymic else '',
                        'cropped_photo': member.cropped_photo.url
                    }
                    for member in team.members.all()
                ]
            }

            return JsonResponse(data=response_data)
