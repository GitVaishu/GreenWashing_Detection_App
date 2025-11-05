# Use a lightweight official Python image
FROM python:3.10-slim

# Install Tesseract OCR and its language data directly from Linux packages
# This avoids the complex compilation errors seen with pip install
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /app

# Set Tesseract data prefix (where PyMuPDF and pytesseract look for eng.traineddata)
ENV TESSDATA_PREFIX /usr/share/tesseract/tessdata
ENV PATH $PATH:/usr/bin

# Copy requirements file and install dependencies
# We use --no-cache-dir to keep the final image size small
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code (your main.py, ml_core.py, etc.)
COPY backend /app/backend

# Command to run the application (Must point to the correct file path)
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT