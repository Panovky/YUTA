from django.shortcuts import render
from django.views import View
from projects.models import Project
# from teams.models import TeamMember
from users.models import User


class ProjectsView(View):
    def get(self, request):
        if request.method == 'GET':
            session_user_id = request.session['user_id']
            user = User.objects.get(id=session_user_id)
            user_projects = Project.objects.filter(manager=user)
            teams = []
            #teams = [team_member.team for team_member in TeamMember.objects.filter(user=user)]
            others_projects = []
            for team in teams:
                others_projects.extend(Project.objects.filter(team=team))

            return render(
                request,
                'projects.html',
                context={
                    'user_projects': user_projects,
                    'others_projects': others_projects,
                    'menu_user_id': session_user_id
                }
            )
