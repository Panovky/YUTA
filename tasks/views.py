from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View
from users.models import User


class TasksView(View):
    def get(self, request):
        if not request.session['user_id']:
            return redirect('main')
        session_user_id = request.session['user_id']
        user = User.objects.get(id=session_user_id)

        return render(
            request,
            'tasks.html',
            context={
                'user': user,
                'menu_user_id': session_user_id
            }
        )

    def post(self, request):
        if not request.session['user_id']:
            return redirect('main')
        action = request.POST['action']

        if action == 'navbar_search_user':
            user_name = request.POST['navbar_user_name']
            return JsonResponse(data=User.objects.search(user_name).as_found())
