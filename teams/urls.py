from django.urls import path
from . import views

urlpatterns = [
    path('/new/<str:stage>', views.NewTeamView.as_view(), name='new_team'),
    path('', views.TeamsView.as_view(), name='teams'),
]
