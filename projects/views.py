import datetime
import json
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from YUTA.settings import MEDIA_ROOT
from projects.models import Project
from teams.models import Team
from users.models import User


class ProjectsView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=session_user_id)
        today = datetime.date.today().isoformat()
        managed_projects = user.manager_projects.all()
        others_projects = [project for team in user.teams.all() for project in team.team_projects.all()]

        return render(
            request,
            'projects.html',
            context={
                'user': user,
                'today': today,
                'managed_projects': managed_projects,
                'others_projects': others_projects,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        action = request.POST.get('action')

        if action == 'delete_project':
            project_id = request.POST.get('project_id')
            Project.objects.get(id=project_id).delete()
            return redirect('projects')

        if action == 'search_team':
            team_name = request.POST.get('team_name').strip()
            leader = User.objects.get(id=session_user_id)
            teams = Team.objects.filter(name__istartswith=team_name) & Team.objects.filter(leader=leader)

            project_teams_id = json.loads(request.POST.get('project_teams_id'))
            prohibited_id = [project_team_id for project_team_id in project_teams_id]
            teams = teams.exclude(id__in=prohibited_id)

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

        if action == 'create_project':
            name = request.POST.get('project_name').strip()
            description = request.POST.get('project_descr').strip()

            if request.FILES.get('project_tech_task'):
                file = request.FILES.get('project_tech_task')
                fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\projects_tech_tasks')
                file_name = fs.save(file.name, file)
                technical_task = f'projects_tech_tasks/{file_name}'
            else:
                technical_task = None

            deadline = request.POST.get('project_deadline')
            manager = User.objects.get(id=session_user_id)

            if request.POST.get('project_team_id'):
                team = Team.objects.get(id=request.POST.get('project_team_id'))
            else:
                team = None

            Project.objects.create(
                name=name,
                description=description,
                technical_task=technical_task,
                deadline=deadline,
                manager=manager,
                team=team
            )
            return redirect('projects')

