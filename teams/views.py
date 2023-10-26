from django.shortcuts import render
from django.views import View
from users.models import User


class TeamsView(View):
    def get(self, request):
        session_user_id = request.session['user_id']
        managed_teams = User.objects.get(id=session_user_id).leader_teams.all()
        others_teams = User.objects.get(id=session_user_id).teams.all()
        return render(
            request,
            'teams.html',
            context={
                'menu_user_id': session_user_id,
                'managed_teams': managed_teams,
                'others_teams': others_teams
            }
        )
