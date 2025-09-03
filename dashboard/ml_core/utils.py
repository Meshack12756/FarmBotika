# advisory/ml_core/utils.py
import os
import joblib
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def load_model(filename):
    model_path = os.path.join(settings.BASE_DIR, 'dashboard', 'ml_models', filename)

    if not os.path.exists(model_path):
        logger.warning(f"⚠️ Model file not found: {model_path}")
        return None

    return joblib.load(model_path)



