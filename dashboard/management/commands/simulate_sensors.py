import time
import random
from django.core.management.base import BaseCommand
from dashboard.models import SensorData

class Command(BaseCommand):
    help = 'Simulate live sensor data every 10 seconds'

    def handle(self, *args, **kwargs):
        while True:
            SensorData.objects.create(
                ph=round(random.uniform(5.5, 7.5), 2),
                temperature=round(random.uniform(18, 35), 2),
                humidity=round(random.uniform(30, 90), 2),
                moisture_numeric=round(random.uniform(10, 60), 2),
                n=random.randint(30, 40),
                p=random.randint(36, 54),
                k=random.randint(10, 120),
                altitude=round(random.uniform(1000, 2500), 2),
            )
            print("Inserted new simulated sensor data")
            time.sleep(10)