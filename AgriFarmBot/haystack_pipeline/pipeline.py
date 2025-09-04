import time
import logging
import pandas as pd
from pathlib import Path

from haystack import Document, Pipeline
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import HuggingFaceLocalChatGenerator
from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import HTMLToDocument
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.embedders import SentenceTransformersTextEmbedder, SentenceTransformersDocumentEmbedder
from haystack.dataclasses import ChatMessage

from models.model_service import ModelService

# Load disease prediction models once
model_service = ModelService()

def build_pipeline(project_root: Path): 
    start_time = time.time()
    print("🔧 Building FarmBotika QA pipeline...")

    # ----------------------------------------
    # 1. Load CSV and create Documents
    # ----------------------------------------
    csv_path = project_root / "data" / "AgroQA_Dataset.csv"
    df = pd.read_csv(csv_path)

    documents = []
    for _, row in df.iterrows():
        answer_text = str(row.get("answer", "")).strip()
        question_text = str(row.get("question", "")).strip()
        crop_name = str(row.get("crop", "")).strip()
        if not answer_text:
            continue
        meta = {
            "crop": crop_name,
            "question": question_text,
            "source": "FarmBotika_QA"
        }
        documents.append(Document(content=answer_text, meta=meta))

    # ----------------------------------------
    # 2. Fetch and convert web pages
    # ----------------------------------------
    fetcher = LinkContentFetcher()
    converter = HTMLToDocument()
    urls = [
        "https://www.theorganicfarmer.org",
        "https://www.kephis.org",
    ]

    successful_streams = []
    for url in urls:
        try:
            result = fetcher.run(urls=[url])
            successful_streams.extend(result.get("streams", []))
        except Exception as e:
            logging.warning(f"Skipping URL fetch {url}: {e}")

    if successful_streams:
        try:
            html_docs = converter.run(sources=successful_streams).get("documents", [])
            documents.extend(html_docs)
        except Exception as e:
            logging.warning(f"HTML conversion error: {e}")

    # ----------------------------------------
    # 3. Initialize Document Store & index
    # ----------------------------------------
    document_store = InMemoryDocumentStore()
    seen_ids = set()
    unique_documents = []
    for doc in documents:
        if doc.id not in seen_ids:
            unique_documents.append(doc)
            seen_ids.add(doc.id)

    # ----------------------------------------
    # 4. Embedding & Retrieval
    # ----------------------------------------
    text_embedder = SentenceTransformersTextEmbedder(
        model="sentence-transformers/all-MiniLM-L6-v2"
    )
    doc_embedder = SentenceTransformersDocumentEmbedder(
        model="sentence-transformers/all-MiniLM-L6-v2"
    )
    doc_embedder.warm_up()

    embedded_docs = doc_embedder.run(documents=unique_documents)["documents"]
    document_store.write_documents(embedded_docs)

    retriever = InMemoryEmbeddingRetriever(
        document_store=document_store,
        scale_score=True,
        top_k=5
    )

    # ----------------------------------------
    # 5. Prompt & Generator
    # ----------------------------------------
    template = [
    ChatMessage.from_system("You are an agronomy assistant. Use the provided context to answer the question."),
    ChatMessage.from_system("{% for document in documents %}{{ document.content }}\n{% endfor %}"),
    ChatMessage.from_user("{{question}}")
]

    prompt_builder = ChatPromptBuilder(
        template=template,
        required_variables=["documents", "question"]
    )

    generator = HuggingFaceLocalChatGenerator(
        model="HuggingFaceH4/zephyr-7b-alpha"
    )
    generator.warm_up()

    # ----------------------------------------
    # 6. Assemble the RAG Pipeline
    # ----------------------------------------
    pipe = Pipeline()
    pipe.add_component("text_embedder", text_embedder)
    pipe.add_component("retriever", retriever)
    pipe.add_component("prompt_builder", prompt_builder)
    pipe.add_component("generator", generator)

    pipe.connect("text_embedder.embedding", "retriever.query_embedding")
    pipe.connect("retriever.documents", "prompt_builder.documents")
    pipe.connect("prompt_builder.prompt", "generator.messages")

    print("✅ Pipeline connections:")
    for connection in pipe.graph.edges:
        print(f"{connection[0]} → {connection[1]}")

    print(f"🕒 Pipeline built in {time.time()-start_time:.2f} seconds")
    return pipe

# ----------------------------------------
# Disease Prediction Wrapper
# ----------------------------------------
def predict_disease(crop: str, features: list):
    return model_service.predict(crop, features)