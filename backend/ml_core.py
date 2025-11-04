# import torch
# from transformers import pipeline
# from typing import Tuple, List, Dict
# from .models import Score

# # --- Configuration ---
# # The model used in the original app.py
# MODEL_NAME = "typeform/distilbert-base-uncased-mnli"

# # Define the primary labels for classification
# PRIMARY_LABELS = [
#     "Greenwashing",
#     "Genuine Sustainability",
#     "Marketing Hype"
# ]

# # Label mapping for main categories and their detailed indicators (from app.py)
# LABEL_MAP = {
#     "Greenwashing": [
#         "Misleading environmental claim",
#         "Vague sustainability statement",
#         "Unsubstantiated green marketing",
#         "Overstated eco-friendly benefits",
#         "Use of irrelevant green imagery"
#     ],
#     "Genuine Sustainability": [
#         "Authentic environmental commitment",
#         "Verified sustainable practice",
#         "Third-party sustainability certification",
#         "Transparency in environmental impact",
#         "Evidence-based climate action"
#     ],
#     "Marketing Hype": [
#         "Generic green buzzwords",
#         "Emotional appeal without proof",
#         "Sustainability used as a selling point",
#         "Trendy environmental phrasing"
#     ]
# }

# # Pre-calculate the flat list of all detailed labels
# ALL_DETAILED_LABELS = []
# for labels in LABEL_MAP.values():
#     ALL_DETAILED_LABELS.extend(labels)


# class GreenwashClassifier:
#     """Handles the loading and execution of the zero-shot classification model."""
    
#     # Classifier pipeline instance
#     classifier: pipeline = None
    
#     def __init__(self):
#         """Initialize the classifier and load the model."""
#         if self.classifier is None:
#             self.load_model()

#     def load_model(self):
#         """Loads the zero-shot classification model."""
#         print(f"Loading AI model: {MODEL_NAME}...")
#         try:
#             # Check for GPU and set device accordingly
#             device = 0 if torch.cuda.is_available() else -1
#             self.classifier = pipeline(
#                 "zero-shot-classification",
#                 model=MODEL_NAME,
#                 device=device
#             )
#             print("✅ Model loaded successfully!")
#         except Exception as e:
#             print(f"❌ Error loading model: {e}")
#             self.classifier = None
            
#     def _process_result(self, result: dict) -> List[Score]:
#         """Converts raw transformer result into a list of Score Pydantic models."""
#         return [
#             Score(label=label, score=score)
#             for label, score in zip(result['labels'], result['scores'])
#         ]

#     def analyze_claim(self, text: str) -> Tuple[List[Score], List[Score]]:
#         """
#         Analyzes the sustainability claim using the zero-shot classifier.
        
#         Args:
#             text: The claim string to analyze.
            
#         Returns:
#             A tuple containing (primary_scores, detailed_scores).
#         """
#         if self.classifier is None:
#             raise RuntimeError("ML Model not loaded.")
            
#         # 1. Primary classification (Greenwashing, Genuine, Hype)
#         primary_result = self.classifier(text, PRIMARY_LABELS, multi_label=True)
#         primary_scores = self._process_result(primary_result)
        
#         # 2. Detailed indicator analysis
#         detailed_result = self.classifier(text, ALL_DETAILED_LABELS, multi_label=True)
#         detailed_scores = self._process_result(detailed_result)
        
#         return primary_scores, detailed_scores

#     def group_detailed_scores(self, detailed_scores: List[Score]) -> Dict[str, List[Score]]:
#         """Groups detailed scores back into the three primary categories."""
#         grouped = {cat: [] for cat in PRIMARY_LABELS}
        
#         # Iterate over the scores and assign them to the correct group based on LABEL_MAP
#         for score in detailed_scores:
#             for cat, labels in LABEL_MAP.items():
#                 if score.label in labels:
#                     grouped[cat].append(score)
#                     break
                    
#         return grouped

# # Singleton instance for the ML Core
# # This ensures the model is loaded only once when the server starts.
# CLASSIFIER_INSTANCE = GreenwashClassifier()

"""
ML Core Logic for Greenwashing Detection.
Handles model loading and zero-shot classification logic.
"""
from transformers import pipeline
from typing import List, Dict, Any
import torch

# Detailed labels used for deeper indicator analysis
LABEL_MAP = {
    "Greenwashing": [
        "Misleading environmental claim",
        "Vague sustainability statement",
        "Unsubstantiated green marketing",
        "Overstated eco-friendly benefits",
        "Use of irrelevant green imagery"
    ],
    "Genuine Sustainability": [
        "Authentic environmental commitment",
        "Verified sustainable practice",
        "Third-party sustainability certification",
        "Transparency in environmental impact",
        "Evidence-based climate action"
    ],
    "Marketing Hype": [
        "Generic green buzzwords",
        "Emotional appeal without proof",
        "Sustainability used as a selling point",
        "Trendy environmental phrasing"
    ]
}

class MLModel:
    """Singleton class to hold the loaded AI model."""
    _instance = None
    classifier = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModel, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Loads the zero-shot classification model."""
        print("Loading AI model: typeform/distilbert-base-uncased-mnli...")
        try:
            # Use GPU if available, otherwise use CPU
            device = 0 if torch.cuda.is_available() else -1
            self.classifier = pipeline(
                "zero-shot-classification",
                model="typeform/distilbert-base-uncased-mnli",
                device=device
            )
            print("✅ Model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.classifier = None

    def analyze_claim(self, text: str) -> Dict[str, Any]:
        """
        Analyzes a text claim for greenwashing using zero-shot classification.
        Returns a structured dictionary matching the frontend's required format.
        """
        if not self.classifier:
            raise RuntimeError("ML model is not loaded.")

        # 1. Primary Classification (Greenwashing, Genuine, Hype)
        primary_labels = list(LABEL_MAP.keys())
        primary_result = self.classifier(text, primary_labels, multi_label=False)

        # 2. Detailed Analysis (All specific indicators)
        detailed_labels = []
        for labels in LABEL_MAP.values():
            detailed_labels.extend(labels)
        
        # Ensure only unique labels are sent for classification
        detailed_result = self.classifier(text, list(set(detailed_labels)), multi_label=True)

        # 3. Structure Detailed Results
        grouped_analysis = {key: [] for key in LABEL_MAP.keys()}

        for label, score in zip(detailed_result['labels'], detailed_result['scores']):
            # Find which primary category this detailed label belongs to
            for category, indicators in LABEL_MAP.items():
                if label in indicators:
                    grouped_analysis[category].append({"label": label, "score": float(score)})
                    break
        
        # 4. Final structured response
        main_prediction = primary_result['labels'][0]
        main_confidence = float(primary_result['scores'][0])
        
        # Format primary scores list
        primary_scores = [{"label": label, "score": float(score)} for label, score in zip(primary_result['labels'], primary_result['scores'])]

        return {
            "prediction": main_prediction,
            "confidence": main_confidence,
            "scores": primary_scores,
            "detailed_analysis": grouped_analysis
        }
