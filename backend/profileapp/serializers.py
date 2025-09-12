from rest_framework import serializers
from .models import Developer, Skill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class DeveloperSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source='skills',
        many=True,
        queryset=Skill.objects.all(),
        write_only=True
    )

    class Meta:
        model = Developer
        fields = [
            'id', 'first_name', 'last_name', 'email', 'about',
            'profile_photo', 'intro_video', 'resume', 'skills', 'skill_ids'
        ]