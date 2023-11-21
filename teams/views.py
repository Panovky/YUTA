from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
from teams.models import Team
from users.models import User


class TeamsView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=session_user_id)
        managed_teams = user.leader_teams.all()
        others_teams = user.teams.all()
        request.session['team_name'] = None
        request.session['project_id'] = None
        request.session['members_id'] = None
        return render(
            request,
            'teams.html',
            context={
                'user': user,
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

        if request.POST.get('action') == 'search_user':
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

            response_data = {
                'users': [
                    {
                        'id': user.id,
                        'photo': user.cropped_photo.url,
                        'last_name': user.last_name,
                        'first_name': user.first_name,
                        'patronymic': user.patronymic,
                    }
                    for user in users
                ]
            }
            return JsonResponse(data=response_data)

