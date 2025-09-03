# advisory/ml_core/fertilizer.py
from .utils import load_model
import numpy as np

def recommend_fertilizer(features_dict):
    """
    Recommends top 3 fertilizers based on input features.

    features_dict = {
        "ph": float,
        "temperature": float,
        "humidity": float,
        "moisture_numeric": float,
        "n": int,
        "p": int,
        "k": int,
        "altitude": float,          # If used
        "soil_type": str,
        "crop": str                 # Unencoded; will be encoded
    }
    """
    # Load models and encoders
    model = load_model("fertilizer2_ensemble_model.pkl")
    fertilizer_encoder = load_model("fertilizer2_label_encoder.pkl")
    label_encoders = load_model("feature_label_encoders.pkl")  # Must include 'soil_type' and 'crop'

    # --- Encode soil_type ---
    soil_encoder = label_encoders.get("soil_type")
    if soil_encoder:
        try:
            features_dict["soil_type"] = int(soil_encoder.transform([features_dict["soil_type"]])[0])
        except:
            features_dict["soil_type"] = 0
    else:
        features_dict["soil_type"] = 0

    # --- Encode crop ---
    crop_encoder = label_encoders.get("crop")
    if crop_encoder:
        try:
            features_dict["crop"] = int(crop_encoder.transform([features_dict["crop"]])[0])
        except:
            features_dict["crop"] = 0
    else:
        features_dict["crop"] = 0

    # Expected order of features (adjust if your model expects altitude too)
    feature_order = ['ph', 'temperature', 'humidity', 'moisture_numeric', 'n', 'p', 'k', 'soil_type', 'crop']

    # Prepare feature array
    features = np.array([[features_dict[f] for f in feature_order]])

    # Predict top 3 fertilizers
    proba = model.predict_proba(features)[0]
    top_indices = proba.argsort()[-3:][::-1]
    top_fertilizers = fertilizer_encoder.inverse_transform(top_indices)

    return list(top_fertilizers)

