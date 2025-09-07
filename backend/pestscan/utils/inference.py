import joblib
import os
from django.conf import settings

MODEL_DIR = os.path.join(settings.BASE_DIR, 'models')

def load_model(model_name):
    try:
        path = os.path.join(MODEL_DIR, model_name)
        return joblib.load(path)
    except Exception as e:
        print(f"[Load Error] {model_name}: {e}")
        return None

def run_detection(input_data, category="pest"):
    model = load_model(f"{category}_model.pkl")
    if not model:
        return {"error": "Model not found"}
    try:
        prediction = model.predict([input_data])[0]
        return {"result": prediction}
    except Exception as e:
        print(f"[Prediction Error] {e}")
        return {"error": "Invalid input or model failure"}