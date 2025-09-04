import streamlit as st
from haystack_pipeline.pipeline import build_pipeline, predict_disease
from pathlib import Path
from threading import Thread
import queue
import time
import pandas as pd

# ----------------------------------------
# Cache the pipeline to avoid reloading
# ----------------------------------------
@st.cache_resource
def load_pipeline():
    return build_pipeline(Path(__file__).parent)

pipe = load_pipeline()
result_queue = queue.Queue()

def run_pipeline_async(question, result_queue):
    """Run pipeline in a separate thread to keep UI responsive"""
    try:
        result = pipe.run({
            "text_embedder": {"text": question},
            "prompt_builder": {"question": question}
        })
        result_queue.put(result)
    except Exception as e:
        result_queue.put(e)

# ----------------------------------------
# UI Layout
# ----------------------------------------
st.set_page_config(page_title="FarmBotika", page_icon="🌾", layout="centered")
st.title("🌾 FarmBotika Agronomy Assistant")

mode = st.radio("Choose mode:", ["Agronomy Chat", "Disease Prediction"])

# ----------------------------------------
# Mode 1: Agronomy Chat
# ----------------------------------------
if mode == "Agronomy Chat":
    st.markdown("💬 Ask a question about crop care, soil health, or farming techniques.")
    st.markdown("💡 Example: *How do I prevent blight in tomatoes during the rainy season?*")

    question = st.text_input("Your question:")

    if st.button("Submit") and question:
        if 'result' in st.session_state:
            del st.session_state['result']

        Thread(target=run_pipeline_async, args=(question, result_queue)).start()

        with st.spinner("Analyzing your question..."):
            while not result_queue.qsize():
                time.sleep(0.1)

            result = result_queue.get()

            if isinstance(result, Exception):
                st.error(f"Error: {str(result)}")
            else:
                reply = result["generator"]["replies"][0].text
                st.session_state.result = reply

    if 'result' in st.session_state:
        st.success(st.session_state.result)
        timestamp = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M")
        st.caption(f"Response generated on {timestamp} using FarmBotika knowledge base.")

# ----------------------------------------
# Mode 2: Disease Prediction
# ----------------------------------------
elif mode == "Disease Prediction":
    st.markdown("🔍 Predict crop diseases based on sensor features.")
    crop = st.selectbox("Select crop:", [
        "beans", "cabbage", "maize", "potato", "tomato", "watermelon"
    ])
    feature_input = st.text_input("Enter features (comma-separated):", "0.5,0.2,0.8")

    if st.button("Predict"):
        try:
            features = [float(x.strip()) for x in feature_input.split(",")]
            expected_length = 3  # Adjust based on model expectations
            if len(features) != expected_length:
                st.warning(f"Expected {expected_length} features for {crop}. Got {len(features)}.")
            else:
                prediction = predict_disease(crop, features)
                st.success(f"🧪 {crop.capitalize()} → {prediction}")
        except Exception as e:
            st.error(f"Prediction error: {str(e)}")