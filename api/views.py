from django.http import JsonResponse
from rest_framework.views import APIView
from YUTA.utils import authorize_user


class AuthorizationView(APIView):
    def post(self, request):
        login = request.data.get('login')
        password = request.data.get('password')
        user = authorize_user(login, password)
        response_data = {
            'status': 'OK' if user else 'Failed',
            'user_id': user.id if user else None
        }
        return JsonResponse(data=response_data)
