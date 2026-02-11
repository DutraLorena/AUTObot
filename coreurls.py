# backend/apps/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'fipe', views.FipeViewSet, basename='fipe')

urlpatterns = [
    # Autenticação
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    
    # FIPE
    path('', include(router.urls)),
]