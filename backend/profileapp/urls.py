# backend/profileapp/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeveloperViewSet, SkillViewSet

router = DefaultRouter()
router.register(r'developers', DeveloperViewSet)
router.register(r'skills', SkillViewSet)

urlpatterns = [
    path('', include(router.urls)),
]