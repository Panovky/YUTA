from django.urls import path
from . import views

urlpatterns = [
    path('authorization', views.AuthorizationView.as_view(), name="authorization"),
    path('profile', views.ProfileView.as_view(), name="profile")
]
