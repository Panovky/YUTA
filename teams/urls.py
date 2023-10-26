from django.urls import path
from . import views

urlpatterns = [
    path('', views.TeamsView.as_view(), name='teams')
]