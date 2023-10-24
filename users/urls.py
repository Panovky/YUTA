from django.urls import path
from . import views

urlpatterns = [
    path('<int:url_user_id>', views.ProfileView.as_view(), name='profile')
]