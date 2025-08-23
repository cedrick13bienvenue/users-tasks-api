# Setup Guide for Users-Tasks API

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=users_tasks_db
TYPEORM_LOGGING=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Database Setup

1. Make sure PostgreSQL is running
2. Create a database named `users_tasks_db`
3. The application will automatically create tables on startup (synchronize: true)

## Running the Application

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Build and start in production mode
npm run build
npm run start:prod
```

## Testing the API - Step by Step

### 1. Start the Application

```bash
npm run start:dev
```

### 2. Open Swagger UI

- Navigate to: http://localhost:3000/api
- You should see all endpoints with proper documentation

### 3. Create a User (Signup)

- Find the `/auth/signup` endpoint
- Click "Try it out"
- Enter user details:
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- Click "Execute"
- **Copy the `accessToken` from the response**

### 4. Authorize in Swagger

- Click the **"Authorize"** button (🔒) at the top of the page
- In the "Value" field, you can now enter:
  - **Option 1 (Recommended):** Just the token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Option 2:** Full Bearer format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click "Authorize"
- Click "Close"

### 5. Test Protected Endpoints

- Try creating a task with `/tasks` POST endpoint
- The request should now work without "Unauthorized" errors

## Troubleshooting

### Common Issues

1. **"Unauthorized" error when creating tasks**
   - ✅ Make sure you're logged in and have a valid JWT token
   - ✅ Check that the token is properly set in Swagger's Authorize button
   - ✅ **FLEXIBLE**: You can now enter just the token OR "Bearer " + token
   - ✅ Verify the JWT_SECRET environment variable is set
   - ✅ Check the console logs for JWT validation details

2. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check database credentials in .env file
   - Verify the database exists

3. **JWT token issues**
   - Check that JWT_SECRET is set in .env
   - Verify the token hasn't expired
   - **CRITICAL**: Token format must be `Bearer <token>` (with space)

### Debug Mode

The application now includes comprehensive logging. Check the console output for:

- JWT Strategy initialization
- User validation attempts
- Authentication success/failure
- Database connection status

### JWT Token Format

**Now Supports Multiple Formats:**

**Option 1 (Recommended):**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option 2 (Traditional):**

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Invalid Format (will not work):**

```
Bearer:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (colon instead of space)
```

### Testing JWT Tokens

You can test JWT token generation and validation using the debug script:

```bash
node debug-jwt.js
```
