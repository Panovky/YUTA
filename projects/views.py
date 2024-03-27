import datetime
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from YUTA.settings import MEDIA_ROOT
from projects.models import Project
from teams.models import Team
from users.models import User
from YUTA.utils import get_project_info, search_users


class ProjectsView(View):
    def get(self, request):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        user = User.objects.get(id=session_user_id)
        today = datetime.date.today().isoformat()
        timestamp = int(datetime.datetime.now().timestamp())
        managed_projects = user.manager_projects.all()
        others_projects = [project for team in user.teams.all() for project in team.team_projects.all()]

        return render(
            request,
            'projects.html',
            context={
                'user': user,
                'today': today,
                'timestamp': timestamp,
                'managed_projects': managed_projects,
                'others_projects': others_projects,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        action = request.POST['action']

        if action == 'navbar_search_user':
            user_name = request.POST['navbar_user_name']
            return JsonResponse(data=search_users(user_name))

        if action == 'delete_project':
            Project.objects.get(id=request.POST['project_id']).delete()
            return redirect('projects')

        if action == 'search_team':
            team_name = request.POST['team_name'].strip()
            leader = User.objects.get(id=session_user_id)
            teams = Team.objects.filter(name__icontains=team_name) & Team.objects.filter(leader=leader)

            if request.POST.get('project_team_id'):
                teams = teams.exclude(id=request.POST['project_team_id'])

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
            Project.objects.create_project(
                name=request.POST['project_name'].strip(),
                description=request.POST['project_description'].strip(),
                technical_task=request.FILES.get('project_technical_task'),
                deadline=request.POST['project_deadline'],
                manager_id=session_user_id,
                team_id=request.POST.get('project_team_id')
            )
            return redirect('projects')

        if action == 'edit_project':
            project = Project.objects.get(id=request.POST['project_id'])
            name = request.POST['project_name'].strip()
            description = request.POST['project_description'].strip()
            deadline = request.POST['project_deadline']
            status = request.POST['project_status']

            if request.FILES.get('project_technical_task'):
                file = request.FILES['project_technical_task']
                file_name = f'technical_task_{project.id}.pdf'
                fs = FileSystemStorage(location=f'{MEDIA_ROOT}\\projects_technical_tasks')

                if fs.exists(file_name):
                    fs.delete(file_name)

                fs.save(file_name, file)
                technical_task = f'projects_technical_tasks/{file_name}'
            else:
                technical_task = None

            if request.POST.get('project_team_id'):
                team = Team.objects.get(id=request.POST['project_team_id'])
            else:
                team = None

            project.name = name
            project.description = description
            project.technical_task = technical_task
            project.deadline = deadline
            project.status = status
            project.team = team
            project.save()
            return redirect('projects')

        if action == 'get_project_info':
            project_id = request.POST['project_id']
            return JsonResponse(data=get_project_info(project_id))
