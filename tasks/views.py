from django.shortcuts import render, redirect
from django.views.generic import View
from users.models import User


class TasksView(View):
    def get(self, request):
        if not request.session.get('user_id'):
            return redirect('main')
        session_user_id = request.session.get('user_id')
        user = User.objects.get(id=session_user_id)

        return render(
            request,
            'tasks.html',
            context={
                'user': user,
                'menu_user_id': session_user_id
            }
        )
