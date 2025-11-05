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
import pytesseract
from PIL import Image

os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'
# Local imports
from .models import TextClaim, GreenwashResponse # Assuming models.py is in the same directory
from .ml_core import MLModel

# --- Initialization ---
app = FastAPI(title="Greenwash Detector API", version="1.0")

# --- THIS IS THE NEW TESSERACT PATH ---
# UPDATE THIS PATH if you installed Tesseract somewhere else
# CHANGE THIS LINE
pytesseract.pytesseract.tesseract_cmd = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

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

# --- THIS IS THE NEW IMAGE ENDPOINT ---
@app.post("/api/classify-image", response_model=GreenwashResponse)
async def classify_image(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image for greenwashing claims.
    It uses Tesseract OCR to extract text and then analyzes the text.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image.")

    try:
        # Read the uploaded file into memory
        contents = await file.read()
        
        # Open the image using PIL (Pillow)
        image = Image.open(io.BytesIO(contents))
        
        # Use Tesseract to extract text from the image
        extracted_text = pytesseract.image_to_string(image, lang='eng')
        
        if not extracted_text or extracted_text.strip() == "":
            raise HTTPException(status_code=400, detail="No text could be extracted from the image.")
        
        # Now, use the ML model (DistilBERT) on the extracted text
        analysis_result = model_instance.analyze_claim(extracted_text)
        
        return analysis_result
        
    except Exception as e:
        # Catch errors from Tesseract or the model
        print(f"Error processing image: {e}") # Print the error to your terminal
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")