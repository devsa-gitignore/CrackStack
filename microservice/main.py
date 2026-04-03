"""
main.py — FastAPI microservice for AR Try-On ML tasks.

Endpoints:
  POST /remove-bg      → removes background from uploaded image, returns transparent PNG
  POST /classify       → classifies garment type using FashionCLIP
  POST /process        → combined: remove bg + classify in one call
  GET  /health         → health check
"""

import time
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from rembg_service import remove_background
from fashionclip_service import classify

app = FastAPI(
    title="AR Try-On ML Service",
    description="Background removal + garment classification microservice",
    version="0.1.0",
)

# Allow CORS from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "ar-tryon-ml"}


@app.post("/remove-bg")
async def remove_bg_endpoint(file: UploadFile = File(...)):
    """
    Remove background from an uploaded image.
    
    Returns: PNG image with transparent background.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    start = time.time()
    image_bytes = await file.read()

    try:
        result_bytes = remove_background(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

    elapsed = round(time.time() - start, 2)
    print(f"[/remove-bg] Processed in {elapsed}s | Input: {len(image_bytes)} bytes → Output: {len(result_bytes)} bytes")

    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={
            "X-Processing-Time": str(elapsed),
        },
    )


@app.post("/classify")
async def classify_endpoint(file: UploadFile = File(...)):
    """
    Classify a garment image using FashionCLIP.
    
    Returns: JSON with label, templateKey, confidence, and all scores.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    start = time.time()
    image_bytes = await file.read()

    try:
        result = classify(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

    elapsed = round(time.time() - start, 2)
    print(f"[/classify] {result['label']} ({result['confidence']:.1%}) in {elapsed}s")

    return JSONResponse(content={
        **result,
        "processingTime": elapsed,
    })


@app.post("/process")
async def process_endpoint(file: UploadFile = File(...)):
    """
    Combined endpoint: remove background + classify in one call.
    
    Returns: JSON with classification results + base64-encoded transparent PNG.
    """
    import base64

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    start = time.time()
    image_bytes = await file.read()

    # Step 1: Remove background
    try:
        clean_png_bytes = remove_background(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

    # Step 2: Classify the clean image
    try:
        classification = classify(clean_png_bytes)
    except Exception as e:
        # Classification failure is non-fatal — return the image without classification
        classification = {
            "label": "unknown",
            "templateKey": "tshirt",
            "confidence": 0.0,
            "allScores": {},
            "error": str(e),
        }

    elapsed = round(time.time() - start, 2)
    print(f"[/process] {classification['label']} ({classification.get('confidence', 0):.1%}) in {elapsed}s")

    # Encode the clean PNG as base64 for JSON transport
    clean_png_b64 = base64.b64encode(clean_png_bytes).decode("utf-8")

    return JSONResponse(content={
        "classification": classification,
        "image": {
            "base64": clean_png_b64,
            "mimeType": "image/png",
            "sizeBytes": len(clean_png_bytes),
        },
        "processingTime": elapsed,
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
