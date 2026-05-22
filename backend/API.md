# API Documentation
# Smart Interview Backend API

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Interviews
- `GET /interviews` - Get all interviews (paginated)
- `GET /interviews/<id>` - Get specific interview
- `POST /interviews` - Create new interview
- `PUT /interviews/<id>` - Update interview
- `PUT /interviews/<id>/questions/<q_id>` - Update question answer
- `DELETE /interviews/<id>` - Delete interview
- `GET /interviews/templates` - Get interview templates

### Resumes
- `GET /resumes` - Get all resumes
- `GET /resumes/<id>` - Get specific resume with analysis
- `POST /resumes/upload` - Upload and analyze resume
- `PUT /resumes/<id>` - Update resume settings
- `DELETE /resumes/<id>` - Delete resume

### Health
- `GET /health` - Health check

## Response Format
All responses follow this format:
```json
{
  "message": "Success message",
  "data": {}
}
```

Errors:
```json
{
  "error": "Error message"
}
```
