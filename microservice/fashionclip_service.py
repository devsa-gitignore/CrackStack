"""
fashionclip_service.py — Garment classification using FashionCLIP.

Uses zero-shot classification: encode the image + a set of text labels,
pick the label with the highest cosine similarity.

Model: patrickjohncyh/fashion-clip (fine-tuned CLIP for fashion domain).
"""

from io import BytesIO
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# ── Model setup ──────────────────────────────────────────────────────────────

MODEL_ID = "patrickjohncyh/fashion-clip"
_processor = None
_model = None

# Garment labels that map to our template system
LABELS = [
    "t-shirt",
    "shirt",
    "jacket",
    "kurta",
    "hoodie",
    "dress",
    "sweater",
    "blazer",
    "coat",
    "polo shirt",
]

# Map FashionCLIP labels → our internal template keys
LABEL_TO_TEMPLATE = {
    "t-shirt": "tshirt",
    "shirt": "shirt",
    "jacket": "jacket",
    "kurta": "kurta",
    "hoodie": "jacket",   # hoodie uses jacket template (wider shoulders)
    "dress": "kurta",     # dress uses kurta template (longer torso)
    "sweater": "tshirt",  # sweater close to tshirt shape
    "blazer": "jacket",
    "coat": "jacket",
    "polo shirt": "tshirt",
}


def _load_model():
    """Lazy-load the model on first classify call (saves ~2GB RAM if unused)."""
    global _processor, _model

    if _model is not None:
        return

    print(f"[FashionCLIP] Loading model: {MODEL_ID}...")
    _processor = CLIPProcessor.from_pretrained(MODEL_ID)
    _model = CLIPModel.from_pretrained(MODEL_ID)
    _model.eval()
    print(f"[FashionCLIP] Model loaded successfully.")


def classify(image_bytes: bytes) -> dict:
    """
    Classify a garment image into one of the predefined categories.

    Args:
        image_bytes: Raw image bytes (should already have background removed).

    Returns:
        dict with keys:
          - label: detected fashion label (e.g. "t-shirt")
          - templateKey: mapped template key (e.g. "tshirt")
          - confidence: float 0-1
          - allScores: dict of all label → confidence pairs
    """
    _load_model()

    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    # Prepare text prompts — adding "a photo of a" improves CLIP accuracy
    text_prompts = [f"a photo of a {label}" for label in LABELS]

    inputs = _processor(
        text=text_prompts,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    with torch.no_grad():
        outputs = _model(**inputs)
        logits = outputs.logits_per_image  # shape: (1, num_labels)
        probs = logits.softmax(dim=1).squeeze()  # shape: (num_labels,)

    # Build results
    scores = {label: round(prob.item(), 4) for label, prob in zip(LABELS, probs)}
    best_idx = probs.argmax().item()
    best_label = LABELS[best_idx]
    best_confidence = probs[best_idx].item()

    return {
        "label": best_label,
        "templateKey": LABEL_TO_TEMPLATE.get(best_label, "tshirt"),
        "confidence": round(best_confidence, 4),
        "allScores": scores,
    }
