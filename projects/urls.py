from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProjectsView.as_view(), name='projects')
]