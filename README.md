# Jewel Backend

A Node.js backend application with authentication, signup, login, and password reset functionality.

## Features

- User registration with email verification
- User login with JWT authentication
- Password reset via email
- Input validation and sanitization
- Rate limiting for security
- CORS support
- MongoDB integration
- Bcrypt password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Email service (Gmail recommended)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jewel-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `env.example` to `.env`
   - Update the environment variables in `.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/jewel_backend
     JWT_SECRET=your_super_secret_jwt_key_here
     JWT_EXPIRE=7d
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password
     PORT=5000
     NODE_ENV=development
     ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email address

### Health Check

- `GET /api/health` - Server health check

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/jewel_backend |
| JWT_SECRET | Secret key for JWT tokens | - |
| JWT_EXPIRE | JWT token expiration time | 7d |
| EMAIL_HOST | SMTP host for emails | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email username | - |
| EMAIL_PASS | Email password/app password | - |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- CORS protection
- Helmet.js for security headers

## Database Schema

### User Model
- `name`: String (required, 2-50 characters)
- `email`: String (required, unique, validated)
- `phoneNumber`: String (required, unique, 10 digits)
- `password`: String (required, min 6 characters, hashed)
- `isEmailVerified`: Boolean (default: false)
- `resetPasswordToken`: String (for password reset)
- `resetPasswordExpire`: Date (token expiration)
- `emailVerificationToken`: String (for email verification)
- `emailVerificationExpire`: Date (token expiration)
- `createdAt`: Date
- `updatedAt`: Date

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## Development

- Use `npm run dev` for development with nodemon
- Use `npm start` for production
- Make sure MongoDB is running
- Configure email settings for password reset functionality

## License

MIT
