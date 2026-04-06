## Manual Execution

1. Create and activate virtual environment
```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run migrations
```bash
python manage.py migrate
```

4. Start server
```bash
python manage.py runserver
```

Access: http://localhost:8000

## Docker Execution

1. Build and run container
```bash
docker compose up --build
```

2. Stop container
```bash
docker compose down
```

Access: http://localhost:8000

## Default Credentials (Development)

A default user is automatically created during migrations for development/testing:

- **Username**: `developer`
- **Password**: `dev123`
- **Email**: `developer@mber.com`
- **Group**: Manager

**Note**: This user has full Manager permissions and can be used to test all API endpoints.

## API Documentation

### Swagger UI
Access the interactive API documentation:
```
http://localhost:8000/api/schema/swagger-ui/
```

### OpenAPI Schema
Download the OpenAPI schema:
```
http://localhost:8000/api/schema/
```

## Endpoints

### Health Check
```
GET /health/
```

Response:
```json
{
  "data": "2026-03-23T22:24:15.123456"
}
```
