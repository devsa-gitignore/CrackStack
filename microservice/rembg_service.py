"""
rembg_service.py — Background removal using the rembg library.

Uses the u2net model by default (best quality for clothing).
Returns a transparent PNG as bytes.
"""

from io import BytesIO
from PIL import Image
from rembg import remove, new_session

# Pre-load the model session at module import time so the first request isn't slow.
# u2net_cloth_seg is specifically trained for clothing segmentation.
# Fallback to u2net (general purpose) if cloth seg isn't available.
try:
    _session = new_session("u2net_cloth_seg")
    MODEL_NAME = "u2net_cloth_seg"
except Exception:
    _session = new_session("u2net")
    MODEL_NAME = "u2net"

print(f"[rembg] Loaded model: {MODEL_NAME}")


def remove_background(image_bytes: bytes) -> bytes:
    """
    Remove the background from an image.

    Args:
        image_bytes: Raw image bytes (JPEG, PNG, WebP, etc.)

    Returns:
        PNG bytes with transparent background.
    """
    input_image = Image.open(BytesIO(image_bytes)).convert("RGBA")

    # rembg.remove returns a PIL Image with transparent background
    output_image = remove(
        input_image,
        session=_session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    # Convert back to bytes
    buf = BytesIO()
    output_image.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()
