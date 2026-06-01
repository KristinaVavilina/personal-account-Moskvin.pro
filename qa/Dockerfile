FROM python:3.12-slim

WORKDIR /qa

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x run_seed.sh

ENV QA_API_BASE=http://backend:8080
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["./run_seed.sh"]
