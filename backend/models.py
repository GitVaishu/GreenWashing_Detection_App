from pydantic import BaseModel
from typing import List, Dict, Union

# Define the structure for a single classification score
class Score(BaseModel):
    """Represents a label and its confidence score."""
    label: str
    score: float

# Define the structure for the main API response
class GreenwashResponse(BaseModel):
    """The full response structure for a greenwashing classification request."""
    input_text: str
    
    # Primary classification result (e.g., Greenwashing)
    prediction: str
    confidence: float
    
    # Detailed scores for all primary labels
    primary_scores: List[Score]
    
    # Detailed analysis indicators
    detailed_scores: List[Score]
    
    # Grouped detailed indicators for easy frontend display
    grouped_indicators: Dict[str, List[Score]]

# Define the structure for the input payload
class ClaimRequest(BaseModel):
    """The structure for the incoming request payload."""
    text: str
    
    # Optional file hash for future file-based analysis (e.g., PDF)
    file_hash: Union[str, None] = None
