# backend/apps/core/views.py
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
import requests
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()

# ========== AUTENTICAÇÃO ==========
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        return self.request.user

# ========== API FIPE ==========
class FipeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    BASE_URL = "https://parallelum.com.br/fipe/api/v1"
    
    @action(detail=False, methods=['get'])
    def marcas(self, request):
        """Lista todas as marcas"""
        cache_key = 'fipe_marcas'
        data = cache.get(cache_key)
        
        if not data:
            try:
                response = requests.get(f"{self.BASE_URL}/carros/marcas", timeout=10)
                data = response.json()
                cache.set(cache_key, data, 60*60*24)  # 24h
            except:
                return Response({'error': 'API FIPE indisponível'}, status=503)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def modelos(self, request):
        """Lista modelos de uma marca"""
        marca_id = request.query_params.get('marca')
        if not marca_id:
            return Response({'error': 'Marca é obrigatória'}, status=400)
        
        cache_key = f'fipe_modelos_{marca_id}'
        data = cache.get(cache_key)
        
        if not data:
            try:
                response = requests.get(
                    f"{self.BASE_URL}/carros/marcas/{marca_id}/modelos",
                    timeout=10
                )
                data = response.json()
                cache.set(cache_key, data, 60*60*24)
            except:
                return Response({'error': 'Erro ao buscar modelos'}, status=500)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def anos(self, request):
        """Lista anos de um modelo"""
        marca_id = request.query_params.get('marca')
        modelo_id = request.query_params.get('modelo')
        
        if not marca_id or not modelo_id:
            return Response({'error': 'Marca e modelo são obrigatórios'}, status=400)
        
        cache_key = f'fipe_anos_{marca_id}_{modelo_id}'
        data = cache.get(cache_key)
        
        if not data:
            try:
                response = requests.get(
                    f"{self.BASE_URL}/carros/marcas/{marca_id}/modelos/{modelo_id}/anos",
                    timeout=10
                )
                data = response.json()
                cache.set(cache_key, data, 60*60*24)
            except:
                return Response({'error': 'Erro ao buscar anos'}, status=500)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def preco(self, request):
        """Consulta preço FIPE"""
        marca_id = request.query_params.get('marca')
        modelo_id = request.query_params.get('modelo')
        ano_id = request.query_params.get('ano')
        
        if not all([marca_id, modelo_id, ano_id]):
            return Response({'error': 'Marca, modelo e ano são obrigatórios'}, status=400)
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/carros/marcas/{marca_id}/modelos/{modelo_id}/anos/{ano_id}",
                timeout=10
            )
            return Response(response.json())
        except:
            return Response({'error': 'Erro ao consultar preço'}, status=500)