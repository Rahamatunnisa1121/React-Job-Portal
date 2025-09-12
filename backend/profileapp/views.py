from django.shortcuts import render
from rest_framework import viewsets
from .models import Developer, Skill
from .serializers import DeveloperSerializer, SkillSerializer

class DeveloperViewSet(viewsets.ModelViewSet):
    queryset = Developer.objects.all()
    serializer_class = DeveloperSerializer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
