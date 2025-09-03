# advisory/ml_core/seeds.py
from .utils import load_model
import numpy as np

def predict_top_3_seeds(crop_name, features_dict):
    """
    Predicts top 3 seed varieties for a given crop using ML.
    Returns a list of seed names or None if model/encoder is missing.
    """
    model_file = f"xgboost_{crop_name.lower()}_model.pkl"
    encoder_file = f"xgboost_{crop_name.lower()}_label_encoder.pkl"

    model = load_model(model_file)
    encoder = load_model(encoder_file)

    if model is None or encoder is None:
        return None

    features = np.array([[features_dict[f] for f in [
        'ph', 'temperature', 'humidity', 'moisture_numeric', 'n', 'p', 'k', 'altitude'
    ]]])

    proba = model.predict_proba(features)[0]
    top_indices = proba.argsort()[-3:][::-1]
    top_seeds = encoder.inverse_transform(top_indices)

    return list(top_seeds)

