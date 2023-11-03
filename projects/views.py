from django.shortcuts import render, redirect
from django.views import View
from users.models import User


class ProjectsView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=session_user_id)
        managed_projects = user.manager_projects.all()
        others_projects = [project for team in user.teams.all() for project in team.team_projects.all()]

        return render(
            request,
            'projects.html',
            context={
                'managed_projects': managed_projects,
                'others_projects': others_projects,
                'menu_user_id': session_user_id
            }
        )
