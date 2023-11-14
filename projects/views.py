from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from projects.models import Project
from teams.models import Team
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
                'user': user,
                'managed_projects': managed_projects,
                'others_projects': others_projects,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')

        if request.POST.get('action') == 'delete_project':
            project_id = request.POST.get('project_id')
            Project.objects.get(id=project_id).delete()
            return redirect('projects')

        if request.POST.get('action') == 'create-team':
            pass

        if request.POST.get('action') == 'search-team':
            team_name = request.POST.get('team_name')
            teams = Team.objects.filter(name__icontains=team_name)
            response_data = {
                'teams': [
                    {
                        'id': team.id,
                        'name': team.name,
                    }
                    for team in teams
                ]
            }
            return JsonResponse(data=response_data)

        if request.POST.get('action') == 'create-project':
            return redirect('projects')

        return redirect('projects')
