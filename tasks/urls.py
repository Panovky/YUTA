from django.urls import path
from . import views

urlpatterns = [
    path('', views.TasksView.as_view(), name='tasks'),
]