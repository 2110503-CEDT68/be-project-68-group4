# VacQ - Vaccine Queue Management API

## Assignment #7: Relationships

A REST API for managing hospital vaccination queues with relationships and authorization.

## Installation

```bash
npm install
```

## Configuration

Create a `config/config.env` file with:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/vacq
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

**Note**: Port 5001 is used instead of 5000 because macOS AirPlay uses port 5000 by default.

## Running the Application

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register - Register user
- POST /api/v1/auth/login - Login user
- GET /api/v1/auth/me - Get current user (Protected)
- GET /api/v1/auth/logout - Logout user

### Hospitals
- GET /api/v1/hospitals - Get all hospitals (Public)
- GET /api/v1/hospitals/:id - Get single hospital (Public)
- POST /api/v1/hospitals - Create new hospital (Admin only)
- PUT /api/v1/hospitals/:id - Update hospital (Admin only)
- DELETE /api/v1/hospitals/:id - Delete hospital (Admin only)

### Appointments
- GET /api/v1/appointments - Get all appointments (Protected)
- GET /api/v1/appointments/:id - Get single appointment (Protected)
- GET /api/v1/hospitals/:hospitalId/appointments - Get appointments for hospital
- POST /api/v1/hospitals/:hospitalId/appointments - Create appointment (Protected, max 3 per user)
- PUT /api/v1/appointments/:id - Update appointment (Owner/Admin only)
- DELETE /api/v1/appointments/:id - Delete appointment (Owner/Admin only)

## Features

- User can create up to 3 appointments
- Users can only see their own appointments
- Admin can see all appointments
- Appointments are linked to both users and hospitals
- Authorization checks for appointment ownership

## Author

Settapun Laoaree (6833275721)

## Testing

This project includes comprehensive API testing using Newman (Postman CLI).

### Running Tests

```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the tests
newman run VacQ_test_collection.json
```

### Test Coverage

The test suite includes 26 assertions covering:
- Authentication (Register, Login)
- Hospital CRUD operations
- Appointment CRUD operations
- Authorization checks

For detailed testing instructions, see [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md)

For test results summary, see [TEST_RESULTS_SUMMARY.md](TEST_RESULTS_SUMMARY.md)
