from rest_framework import serializers
from timetable.models import TimetableConstraint


class GenerateTimetableSerializer(serializers.Serializer):
    """
    Serializer for timetable generation request
    """
    institution_id = serializers.IntegerField()
    name = serializers.CharField(max_length=200)
    semester = serializers.IntegerField(default=1)
    parameters = serializers.JSONField(required=False, default=dict)
    
    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Timetable name must be at least 3 characters long")
        return value.strip()


class TimetableConstraintSerializer(serializers.ModelSerializer):
    """
    Serializer for timetable constraints
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = TimetableConstraint
        fields = [
            'id', 'institution', 'name', 'type', 'type_display',
            'parameters', 'priority', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
