import datetime
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from projects.models import Project
from teams.models import Team
from users.models import User
from services.utils import get_project_info


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
            return JsonResponse(data=User.objects.search(user_name).as_found())

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
            Project.objects.get(id=request.POST['project_id']).update_project(
                name=request.POST['project_name'].strip(),
                description=request.POST['project_description'].strip(),
                technical_task=request.FILES.get('project_technical_task'),
                deadline=request.POST['project_deadline'],
                status=request.POST['project_status'],
                team_id=request.POST.get('project_team_id')
            )
            return redirect('projects')

        if action == 'get_project_info':
            project_id = request.POST['project_id']
            return JsonResponse(data=get_project_info(project_id))
