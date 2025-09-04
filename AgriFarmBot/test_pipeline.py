from pathlib import Path
from haystack_pipeline.pipeline import build_pipeline, predict_disease

# 1. Build the QA pipeline
PROJECT_ROOT = Path(__file__).resolve().parent
pipe = build_pipeline(PROJECT_ROOT)

# 2. Run a QA test query
qa_query = "How do I treat maize leaf blight?"
qa_result = pipe.run({
    "text_embedder": {"text": qa_query},
    "prompt_builder": {"question": qa_query}
})
print("\n🧠 QA Response:")
print(qa_result["generator"]["replies"][0].text)

# 3. Run a disease prediction test
sample_features = [0.7, 0.3, 0.9]  # Replace with actual feature vector
crop_name = "maize"
disease_result = predict_disease(crop_name, sample_features)

print("\n🌾 Disease Prediction:")
print(f"{crop_name.capitalize()} → {disease_result}")