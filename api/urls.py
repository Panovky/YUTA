from django.urls import path
from . import views

urlpatterns = [
    path('authorization', views.AuthorizationView.as_view()),
    path('profile', views.ProfileView.as_view()),
    path('teams', views.TeamsView.as_view())
]
