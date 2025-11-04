# import uvicorn
# from fastapi import FastAPI, HTTPException
# from typing import Dict, Any

# # Import the core ML logic and data models
# from .ml_core import CLASSIFIER_INSTANCE, GreenwashClassifier
# from .models import ClaimRequest, GreenwashResponse

# # Initialize the FastAPI application
# app = FastAPI(
#     title="Greenwashing Detection API",
#     description="Zero-shot classification API for detecting misleading sustainability claims.",
#     version="1.0.0"
# )

# # Initialize the classifier instance (it loads the model on creation)
# # This will ensure the model is ready when the server starts
# # We use the global instance defined in ml_core
# classifier: GreenwashClassifier = CLASSIFIER_INSTANCE


# @app.on_event("startup")
# async def startup_event():
#     """Ensure the model is loaded during application startup."""
#     if classifier.classifier is None:
#         # Attempt to load model again if it failed during initialization
#         classifier.load_model()
#     if classifier.classifier is None:
#         print("CRITICAL: ML model failed to load. API endpoints will raise errors.")


# @app.get("/", tags=["Health"])
# def read_root():
#     """Health check endpoint."""
#     model_status = "Ready" if classifier.classifier else "Loading or Failed"
#     return {"status": "ok", "model_status": model_status, "service": "Greenwash Detection API"}


# @app.post(
#     "/api/classify-text", 
#     response_model=GreenwashResponse, 
#     tags=["Classification"]
# )
# async def classify_claim(request: ClaimRequest):
#     """
#     Analyzes an input text claim and classifies it as Greenwashing, Genuine Sustainability,
#     or Marketing Hype, providing detailed confidence scores.
#     """
#     text = request.text.strip()
    
#     if not classifier.classifier:
#         raise HTTPException(status_code=503, detail="AI Model not yet loaded or failed to initialize.")
    
#     if not text:
#         raise HTTPException(status_code=400, detail="Input text claim cannot be empty.")
    
#     try:
#         # Perform primary and detailed analysis
#         primary_scores, detailed_scores = classifier.analyze_claim(text)

#         # Get the top prediction
#         top_score = primary_scores[0]
        
#         # Group the detailed scores for structured response
#         grouped_indicators = classifier.group_detailed_scores(detailed_scores)
        
#         # Construct the final response object
#         response = GreenwashResponse(
#             input_text=text,
#             prediction=top_score.label,
#             confidence=top_score.score,
#             primary_scores=primary_scores,
#             detailed_scores=detailed_scores,
#             grouped_indicators=grouped_indicators
#         )
        
#         return response

#     except Exception as e:
#         # Log the error on the server side
#         print(f"Classification Error: {e}")
#         # Return a generic 500 error to the client
#         raise HTTPException(
#             status_code=500, 
#             detail="An internal error occurred during classification. Check server logs."
#         )


# if __name__ == "__main__":
#     # Use this to run locally: uvicorn main:app --reload
#     # When running the file directly (e.g., for testing):
#     uvicorn.run(app, host="0.0.0.0", port=8000)
"""
FastAPI application for the Greenwashing Detection API.
Routes all requests to the ML core logic.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import io
import fitz  # PyMuPDF library for PDF processing (imported as fitz)

# Local imports
from .models import TextClaim, GreenwashResponse # Assuming models.py is in the same directory
from .ml_core import MLModel

# --- Initialization ---
app = FastAPI(title="Greenwash Detector API", version="1.0")

# Load the singleton ML model instance at startup
model_instance = MLModel()

# --- CORS Configuration (Crucial for React Native/Expo) ---
# Allows frontend running on different origins (like 192.168.x.x) to connect
origins = ["*"] # Use "*" during development, restrict in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PDF Utility Function ---
def extract_text_from_pdf(file_data: bytes) -> str:
    """Extracts text content from a PDF file."""
    try:
        # Open PDF from memory buffer
        pdf_document = fitz.open(stream=file_data, filetype="pdf")
        text_content = ""
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text_content += page.get_text("text")
        return text_content
    except Exception as e:
        print(f"Error during PDF extraction: {e}")
        # Raise an HTTP exception that FastAPI handles automatically
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {e}")


# --- API Endpoints ---

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"service": "Greenwash Detector API", "status": "running"}

@app.post("/api/classify-text", response_model=GreenwashResponse)
def classify_text(claim: TextClaim):
    """Endpoint for classifying plain text claims."""
    if not model_instance.classifier:
        raise HTTPException(status_code=503, detail="AI Model not ready or failed to load.")

    try:
        # Pass the text to the updated analyze_claim function
        results = model_instance.analyze_claim(claim.text)
        return results
    except Exception as e:
        print(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail="Internal classification error.")

@app.post("/api/classify-file", response_model=GreenwashResponse)
async def classify_file(file: UploadFile = File(...)):
    """Endpoint for processing and classifying uploaded PDF files."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if not model_instance.classifier:
        raise HTTPException(status_code=503, detail="AI Model not ready or failed to load.")

    try:
        # Read file content into memory
        file_data = await file.read()
        
        # Extract text from the PDF content
        extracted_text = extract_text_from_pdf(file_data)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="PDF contained no usable text.")
        
        # Pass the extracted text to the classification function
        results = model_instance.analyze_claim(extracted_text)
        return results
    except HTTPException:
        # Re-raise explicit HTTP exceptions
        raise
    except Exception as e:
        print(f"File classification error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during file processing.")