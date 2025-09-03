from django.db import models

class SensorData(models.Model):
    ph = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    moisture_numeric = models.FloatField()
    n = models.IntegerField()
    p = models.IntegerField()
    k = models.IntegerField()
    altitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SensorData at {self.timestamp}"
