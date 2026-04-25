FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Build context esperado: raiz do repositório.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

EXPOSE 10000

CMD python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
