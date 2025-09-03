# advisory/ml_core/crop.py
from .utils import load_model
import numpy as np

def predict_top_4_crops(features_dict):
    """
    features_dict = {
        "ph": float,
        "temperature": float,
        "humidity": float,
        "moisture_numeric": float,
        "n": int,
        "p": int,
        "k": int
        "altitude": float
        
    }
    """
    model = load_model("xgb_crop_predictor.pkl")
    encoder = load_model("xgb_crop_label_encoder.pkl")

    # Order of features must match model training
    features = np.array([[features_dict[f] for f in ['ph', 'n', 'p', 'k', 'temperature', 'moisture_numeric', 'altitude', 'humidity']]])

    # Predict probabilities for all crops
    proba = model.predict_proba(features)[0]
    top_indices = proba.argsort()[-4:][::-1]  # Top 4 indices
    top_crops = encoder.inverse_transform(top_indices)

    return list(top_crops)
