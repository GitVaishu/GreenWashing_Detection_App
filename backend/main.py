import uvicorn
from fastapi import FastAPI, HTTPException
from typing import Dict, Any

# Import the core ML logic and data models
from .ml_core import CLASSIFIER_INSTANCE, GreenwashClassifier
from .models import ClaimRequest, GreenwashResponse

# Initialize the FastAPI application
app = FastAPI(
    title="Greenwashing Detection API",
    description="Zero-shot classification API for detecting misleading sustainability claims.",
    version="1.0.0"
)

# Initialize the classifier instance (it loads the model on creation)
# This will ensure the model is ready when the server starts
# We use the global instance defined in ml_core
classifier: GreenwashClassifier = CLASSIFIER_INSTANCE


@app.on_event("startup")
async def startup_event():
    """Ensure the model is loaded during application startup."""
    if classifier.classifier is None:
        # Attempt to load model again if it failed during initialization
        classifier.load_model()
    if classifier.classifier is None:
        print("CRITICAL: ML model failed to load. API endpoints will raise errors.")


@app.get("/", tags=["Health"])
def read_root():
    """Health check endpoint."""
    model_status = "Ready" if classifier.classifier else "Loading or Failed"
    return {"status": "ok", "model_status": model_status, "service": "Greenwash Detection API"}


@app.post(
    "/api/classify-text", 
    response_model=GreenwashResponse, 
    tags=["Classification"]
)
async def classify_claim(request: ClaimRequest):
    """
    Analyzes an input text claim and classifies it as Greenwashing, Genuine Sustainability,
    or Marketing Hype, providing detailed confidence scores.
    """
    text = request.text.strip()
    
    if not classifier.classifier:
        raise HTTPException(status_code=503, detail="AI Model not yet loaded or failed to initialize.")
    
    if not text:
        raise HTTPException(status_code=400, detail="Input text claim cannot be empty.")
    
    try:
        # Perform primary and detailed analysis
        primary_scores, detailed_scores = classifier.analyze_claim(text)

        # Get the top prediction
        top_score = primary_scores[0]
        
        # Group the detailed scores for structured response
        grouped_indicators = classifier.group_detailed_scores(detailed_scores)
        
        # Construct the final response object
        response = GreenwashResponse(
            input_text=text,
            prediction=top_score.label,
            confidence=top_score.score,
            primary_scores=primary_scores,
            detailed_scores=detailed_scores,
            grouped_indicators=grouped_indicators
        )
        
        return response

    except Exception as e:
        # Log the error on the server side
        print(f"Classification Error: {e}")
        # Return a generic 500 error to the client
        raise HTTPException(
            status_code=500, 
            detail="An internal error occurred during classification. Check server logs."
        )


if __name__ == "__main__":
    # Use this to run locally: uvicorn main:app --reload
    # When running the file directly (e.g., for testing):
    uvicorn.run(app, host="0.0.0.0", port=8000)
