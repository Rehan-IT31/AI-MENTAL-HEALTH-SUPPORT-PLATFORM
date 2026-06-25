FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    libglib2.0-0 \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libharfbuzz0b \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Cloud Run listens on 8080
EXPOSE 8080

# ✅ CORRECT way to run FastAPI on Cloud Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
