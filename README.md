# Mentore Backend API

Complete backend for login/signup system with role-based functionality (Mentor/Mentee).

## Features

✅ **Role-based Authentication**
- Mentor and Mentee roles
- JWT-based authentication
- Password hashing with bcryptjs (12 rounds)

✅ **User Management**
- User signup with role selection
- User login with email/password
- Profile management and updates

✅ **Mentor-Mentee Relationships**
- Mentors can add multiple mentees
- Mentees can only link to one mentor
- Automatic relationship management

✅ **Security Features**
- Password hashing with bcrypt (12 rounds)
- JWT tokens with 30-day expiration
- Role-based route protection
- Input validation and sanitization
- Rate limiting for API endpoints
- Relationship consistency enforcement

## API Endpoints

### Public Routes

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "mentor", // or "mentee"
  "phone": "+1234567890", // optional
  "expertise": ["JavaScript", "React"], // required for mentors, not allowed for mentees
  "bio": "Experienced developer" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mentor",
    "expertise": ["JavaScript", "React"],
    "bio": "Experienced developer",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/login
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mentor",
    "mentees": [],
    "expertise": ["JavaScript", "React"],
    "bio": "Experienced developer"
  }
}
```

### Protected Routes (Require Authorization Header)

All protected routes require the following header:
```
Authorization: Bearer <your-jwt-token>
```

#### GET /api/auth/me
Get current user profile.

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mentor",
    "mentees": [
      {
        "_id": "mentee_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "mentee"
      }
    ],
    "expertise": ["JavaScript", "React"]
  }
}
```

#### PUT /api/auth/me
Update user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "expertise": ["JavaScript", "React", "Node.js"] // only for mentors
}
```

#### POST /api/auth/assign-mentee (Mentors only)
Assign a mentee to mentor.

**Request Body:**
```json
{
  "menteeEmail": "mentee@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mentee assigned successfully",
  "mentor": {
    "_id": "mentor_id",
    "name": "John Mentor",
    "mentees": [
      {
        "_id": "mentee_id",
        "name": "Bob Student",
        "email": "mentee@example.com",
        "role": "mentee"
      }
    ]
  }
}
```

#### DELETE /api/auth/remove-mentee/:menteeId (Mentors only)
Remove a mentee from mentor.

**Response:**
```json
{
  "success": true,
  "message": "Mentee removed successfully",
  "mentor": {
    "_id": "mentor_id",
    "name": "John Mentor",
    "mentees": []
  }
}
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Copy the example environment file and update as needed:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mentore-db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

4. **Start Server**
   
   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

5. **Verify Installation**
   
   Server runs on http://localhost:5000
   
   Test the health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

## Sample Test Flow

### 1. Create a Mentor
```bash
curl -X POST http://localhost:5000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Alice Mentor",
  "email": "alice@example.com",
  "password": "Password123",
  "role": "mentor",
  "expertise": ["JavaScript", "React", "Node.js"],
  "bio": "Experienced full-stack developer"
}'
```

### 2. Create a Mentee
```bash
curl -X POST http://localhost:5000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Bob Student",
  "email": "bob@example.com",
  "password": "Password123",
  "role": "mentee",
  "bio": "Aspiring web developer"
}'
```

### 3. Login as Mentor
```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "alice@example.com",
  "password": "Password123"
}'
```

### 4. Assign Mentee (use token from login response)
```bash
curl -X POST http://localhost:5000/api/auth/assign-mentee \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <mentor-jwt-token>" \
-d '{
  "menteeEmail": "bob@example.com"
}'
```

### 5. Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
-H "Authorization: Bearer <your-jwt-token>"
```

## Database Schema

### User Model
```javascript
{
  name: String, // required, 2-100 characters
  email: String, // required, unique, valid email
  password: String, // required, min 6 chars, hashed
  role: String, // required, "mentor" or "mentee"
  mentor: ObjectId, // for mentees only, reference to User
  mentees: [ObjectId], // for mentors only, array of User references
  phone: String, // optional, valid phone number
  expertise: [String], // for mentors only, array of skills
  bio: String, // optional, max 500 characters
  isActive: Boolean, // default: true
  timestamps: true // createdAt, updatedAt
}
```

### Relationships
- **One-to-Many**: One mentor can have multiple mentees
- **One-to-One**: Each mentee can have only one mentor
- **Automatic Consistency**: Relationships are automatically maintained
- **Cascade Operations**: Removing users properly cleans up relationships

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors"] // only for validation failures
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **429**: Too many requests (rate limited)
- **500**: Internal server error

## Security Features

- **Password Security**: Bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Security Headers**: XSS protection, content type validation
- **Role-based Access Control**: Route-level permission checking

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP (if implemented)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mentore-db |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | JWT expiration time | 30d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## Project Structure

```
mentore-backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT & authorization
│   ├── error.js             # Error handling
│   ├── rateLimit.js         # Rate limiting
│   └── validation.js        # Input validation
├── models/
│   └── User.js              # User model & schema
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   └── helpers.js           # Utility functions
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies & scripts
├── server.js               # Main application file
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.