from django.shortcuts import render, redirect
from django.views import View
from projects.models import Project
from teams.models import Team
from users.models import User


class NewTeamView(View):
    def get(self, request, stage):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session['user_id']

        if stage == 'choose-team-name':
            leader = User.objects.get(id=session_user_id)
            session_team_name = request.session.get('team_name')
            return render(
                request,
                'new_team.html',
                context={
                    'stage': stage,
                    'team_name': session_team_name,
                    'leader': leader,
                    'menu_user_id': session_user_id
                }
            )

        if stage == 'choose-project':
            session_project_id = request.session.get('project_id')
            if session_project_id:
                project = Project.objects.get(id=session_project_id)
            else:
                project = None
            team_name = request.session.get('team_name')
            return render(
                request,
                'new_team.html',
                context={
                    'stage': stage,
                    'team_name': team_name,
                    'project': project,
                    'menu_user_id': session_user_id
                }
            )

        if stage == 'choose-members':
            members_id = request.session.get('members_id')
            if members_id:
                members = User.objects.filter(id__in=members_id)
            else:
                members = None
            return render(
                request,
                'new_team.html',
                context={
                    'stage': stage,
                    'members': members,
                    'menu_user_id': session_user_id
                }
            )

    def post(self, request, stage):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session['user_id']

        if stage == 'choose-team-name':
            team_name = request.POST.get('team_name').strip()
            if not Team.objects.filter(name=team_name).exists():
                request.session['team_name'] = team_name
                return redirect('new_team', 'choose-project')
            else:
                leader = User.objects.get(id=session_user_id)
                message = f'Команда с таким именем уже существует'
                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'team_name': team_name,
                        'leader': leader,
                        'message': message,
                        'menu_user_id': session_user_id
                    }
                )

        if stage == 'choose-project':
            if request.POST.get('project_name'):
                project_name = request.POST.get('project_name').strip()
                projects = User.objects.get(id=session_user_id).manager_projects.filter(
                    name__icontains=project_name)
                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'projects': projects,
                        'menu_user_id': session_user_id
                    }
                )

            if request.POST.get('project_id'):
                project_id = request.POST.get('project_id')
                request.session['project_id'] = project_id
                project = Project.objects.get(id=project_id)
                team_name = request.session['team_name']
                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'team_name': team_name,
                        'project': project,
                        'menu_user_id': session_user_id
                    }
                )

        if stage == 'choose-members':
            if request.POST.get('user_name'):
                user_name = request.POST.get('user_name').split()
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

                members_id = request.session.get('members_id')
                if members_id:
                    members = User.objects.filter(id__in=members_id)
                    users = users.exclude(id__in=members_id + [session_user_id])
                else:
                    members = None
                    users = users.exclude(id=session_user_id)

                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'users': users,
                        'members': members,
                        'menu_user_id': session_user_id
                    }
                )

            if request.POST.get('user_id'):
                user_id = request.POST.get('user_id')
                if request.session.get('members_id'):
                    request.session['members_id'].append(user_id)
                else:
                    request.session['members_id'] = [user_id]
                request.session.modified = True
                members = User.objects.filter(id__in=request.session['members_id'])
                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'members': members,
                        'menu_user_id': session_user_id
                    }
                )

            if request.POST.get('member_id'):
                member_id = request.POST.get('member_id')
                request.session['members_id'].remove(member_id)
                request.session.modified = True
                members = User.objects.filter(id__in=request.session['members_id'])
                return render(
                    request,
                    'new_team.html',
                    context={
                        'stage': stage,
                        'members': members,
                        'menu_user_id': session_user_id
                    }
                )

            if not request.POST.get('user_name') and not request.POST.get('user_id') \
                    and not request.POST.get('member_id'):
                name = request.session.get('team_name')
                leader = User.objects.get(id=session_user_id)
                members = User.objects.filter(id__in=request.session.get('members_id'))
                team = Team.objects.create(
                    name=name,
                    leader=leader,
                )
                team.members.set(members)
                return redirect('teams')


class TeamsView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        managed_teams = User.objects.get(id=session_user_id).leader_teams.all()
        others_teams = User.objects.get(id=session_user_id).teams.all()
        request.session['team_name'] = None
        request.session['project_id'] = None
        request.session['members_id'] = None
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

        if request.POST.get('action') == 'delete_team':
            team_id = request.POST.get('team_id')
            Team.objects.get(id=team_id).delete()

        return redirect('teams')

