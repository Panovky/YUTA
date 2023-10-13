from django.views.generic import TemplateView


class TasksView(TemplateView):
    template_name = 'tasks.html'
