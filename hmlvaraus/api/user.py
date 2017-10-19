from rest_framework import viewsets, serializers, filters, exceptions, permissions, status, pagination, generics
from rest_framework.response import Response
from users.api import UserSerializer
from users.models import User
from resources.api.base import TranslatedModelSerializer, register_view


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        if pk == "current":
            return self.request.user
        return super(UserViewSet, self).get_object()

register_view(UserViewSet, 'user', base_name='user')
