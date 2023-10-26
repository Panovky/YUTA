from django.shortcuts import render
from django.views import View

from users.models import User


class TeamsView(View):
    def get(self, request):
        session_user_id = request.session['user_id']

        managed_teams = [
            [
                mp.team.name,
                mp.team.leader.photo,
                mp.team.leader.last_name,
                mp.team.leader.first_name,
                [[member.photo, member.last_name, member.first_name] for member in mp.team.members.all()]
            ]
            for mp in User.objects.get(id=session_user_id).manager_projects.all()
        ]

        others_teams = [
            [
                t.name,
                t.leader.photo,
                t.leader.last_name,
                t.leader.first_name,
                [[member.photo, member.last_name, member.first_name] for member in t.members.all()]
            ]
            for t in User.objects.get(id=session_user_id).teams.all()
        ]

        return render(
            request,
            'teams.html',
            context={
                'menu_user_id': session_user_id,
                'managed_teams': managed_teams,
                'others_teams': others_teams
            }
        )
