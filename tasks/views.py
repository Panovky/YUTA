from django.shortcuts import render
from django.views.generic import View
from users.models import User


class TasksView(View):
    def get(self, request):
        if request.method == 'GET':
            user_id = request.session['user_id']
            user = User.objects.get(id=user_id)
            return render(
                request,
                'tasks.html',
                context={'user': user}
            )
