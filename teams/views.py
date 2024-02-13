import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from YUTA.utils import search_user, get_team_info
from teams.models import Team
from users.models import User


class TeamsView(View):
    def get(self, request):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
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
        if not request.session['user_id']:
            return redirect('main')
        action = request.POST['action']

        if action == 'delete_team':
            team_id = request.POST['team_id']
            Team.objects.get(id=team_id).delete()
            return redirect('teams')

        if action == 'check_team_name':
            new_team_name = request.POST['team_name'].strip()

            if request.POST.get('team_id'):
                team_id = request.POST['team_id']
                old_team_name = Team.objects.get(id=team_id).name
                if new_team_name == old_team_name:
                    return JsonResponse({
                        'unique': True}
                    )

            return JsonResponse({
                'unique': not Team.objects.filter(name=new_team_name).exists()
            })

        if action == 'search_user':
            user_name = request.POST['user_name']
            leader_id = request.session['user_id']
            members_id = json.loads(request.POST['members_id'])
            return JsonResponse(data=search_user(user_name, leader_id, members_id))

        if action == 'create_team':
            team_name = request.POST['team_name'].strip()
            team_leader = User.objects.get(id=request.session['user_id'])

            team = Team.objects.create(
                name=team_name,
                leader=team_leader
            )

            team_members_id = json.loads(request.POST['members_id'])
            for member_id in team_members_id:
                member = User.objects.get(id=member_id)
                team.members.add(member)
                member.teams.add(team)

            return redirect('teams')

        if action == 'edit_team':
            team_id = request.POST['team_id']
            team_name = request.POST['team_name'].strip()
            team = Team.objects.get(id=team_id)
            team.name = team_name

            team.members.clear()
            team_members_id = json.loads(request.POST['members_id'])
            for member_id in team_members_id:
                member = User.objects.get(id=member_id)
                team.members.add(member)
                member.teams.add(team)

            team.save()
            return redirect('teams')

        if action == 'get_team_info':
            team_id = request.POST['team_id']
            return JsonResponse(data=get_team_info(team_id))
