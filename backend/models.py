"""
Pydantic Data Models for the FastAPI API.
These define the expected JSON format for requests and responses.
"""
from pydantic import BaseModel
from typing import List, Dict, Union

# Define the structure for a single classification score
class Score(BaseModel):
    """Represents a label and its confidence score."""
    label: str
    score: float

# Define the structure for the input payload
class TextClaim(BaseModel):
    """The structure for the incoming text claim request payload."""
    text: str

# Define the structure for the detailed analysis breakdown (e.g., 'Greenwashing': [Score, ...])
class DetailedAnalysis(BaseModel):
    """The structure for grouped detailed indicators."""
    Greenwashing: List[Score]
    Genuine_Sustainability: List[Score]
    Marketing_Hype: List[Score]
    
    # Allows FastAPI to map Python dict keys (using underscores) to Pydantic (using camelCase if needed)
    class Config:
        alias_generator = lambda string: string.replace('_', ' ').title().replace(' ', '')
        allow_population_by_field_name = True
        
# Define the structure for the main API response
class GreenwashResponse(BaseModel):
    """The full response structure for a greenwashing classification request."""
    
    # Primary classification result (e.g., Greenwashing)
    prediction: str
    confidence: float
    
    # Detailed scores for all primary labels (e.g., Greenwashing, Genuine, Hype)
    scores: List[Score]
    
    # Grouped detailed indicators for easy frontend display
    detailed_analysis: Dict[str, List[Score]]
    