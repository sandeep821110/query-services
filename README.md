# Query Services API

A complete Node.js API service for managing queries with MongoDB, Redis caching, and RabbitMQ message queue integration.

## 🚀 Features

- **User Authentication** - JWT token-based authentication
- **Query Management** - Create, Read, Update, Delete queries
- **Role-Based Access** - User and Admin roles
- **Redis Caching** - High-performance data caching
- **Message Queue** - RabbitMQ for async event processing
- **MongoDB Atlas** - Cloud database integration
- **Error Handling** - Comprehensive error management
- **Health Checks** - API health monitoring

## 📋 Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Redis Cloud account (or local Redis)
- RabbitMQ (local or cloud)
- Postman (for API testing)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd query-services
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/query-services

# Redis Configuration
REDIS_URL=redis://default:password@host:port

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost
QUEUE_NAME=query_queue
```

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Expected Output
```
============================================================
🚀 QUERY SERVICES - INITIALIZATION
============================================================

------------------------------------------------------------
📊 SERVER INFORMATION
------------------------------------------------------------
🚀 Server running on port: 4001
📍 API Base URL: http://localhost:4001
🏥 Health Check: http://localhost:4001/health
📝 Root: http://localhost:4001/

------------------------------------------------------------
📚 QUERY ENDPOINTS
------------------------------------------------------------
POST   http://localhost:4001/api/queries/user/create
GET    http://localhost:4001/api/queries/all
GET    http://localhost:4001/api/queries/user/my-queries
GET    http://localhost:4001/api/queries/user/:id
PUT    http://localhost:4001/api/queries/user/update/:id
DELETE http://localhost:4001/api/queries/user/delete/:id

------------------------------------------------------------
🔧 INITIALIZING SERVICES
------------------------------------------------------------
✓ Connected to MongoDB successfully
✓ Connected to Redis
✓ Connected to RabbitMQ
✓ Message consumer started
============================================================
✓ ALL SERVICES INITIALIZED SUCCESSFULLY
============================================================
```

## 📚 API Endpoints

### 1. Create Query (User)
```
POST /api/queries/user/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "My query message"
}

Response (201):
{
  "success": true,
  "message": "Query created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "My query message",
    "userId": "507f1f77bcf86cd799439012",
    "status": "pending",
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T10:30:00.000Z"
  }
}
```

### 2. Get All Queries (Public)
```
GET /api/queries/all

Response (200):
{
  "success": true,
  "message": "Queries retrieved successfully",
  "count": 5,
  "data": [...]
}
```

### 3. Get My Queries (User)
```
GET /api/queries/user/my-queries
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "My queries retrieved successfully",
  "count": 3,
  "data": [...]
}
```

### 4. Get Query by ID (User)
```
GET /api/queries/user/:id
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Query retrieved successfully",
  "data": {...}
}
```

### 5. Update Query (User)
```
PUT /api/queries/user/update/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Name",
  "message": "Updated message"
}

Response (200):
{
  "success": true,
  "message": "Query updated successfully",
  "data": {...}
}
```

### 6. Delete Query (User)
```
DELETE /api/queries/user/delete/:id
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Query deleted successfully",
  "data": {...}
}
```

### 7. Admin Get All Queries
```
GET /api/queries/admin/all
Authorization: Bearer <ADMIN_JWT_TOKEN>

Query Parameters:
- page=1 (default)
- limit=10 (default)
- status=pending|resolved|in-progress|all (default)

Response (200):
{
  "success": true,
  "message": "All queries retrieved successfully",
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  },
  "data": [...]
}
```

### 8. Admin Get Statistics
```
GET /api/queries/admin/statistics
Authorization: Bearer <ADMIN_JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalQueries": 25,
    "todayQueries": 5,
    "timestamp": "2026-04-02T10:30:00.000Z"
  }
}
```

### 9. Admin Update Query
```
PUT /api/queries/admin/update/:id
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "name": "John Doe",
  "status": "resolved"
}

Response (200):
{
  "success": true,
  "message": "Query updated successfully by admin",
  "data": {...}
}
```

### 10. Admin Delete Query
```
DELETE /api/queries/admin/delete/:id
Authorization: Bearer <ADMIN_JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Query deleted successfully by admin",
  "data": {...}
}
```

### 11. Health Check
```
GET /health

Response (200):
{
  "success": true,
  "message": "Server is running"
}
```

## 🔐 Authentication

### Generate JWT Token

The API uses JWT tokens for authentication. Include the token in the request header:

```
Authorization: Bearer <token>
```

### Example Postman Setup

1. Add header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
2. Or use Postman's Auth tab with:
   - Type: Bearer Token
   - Token: Your JWT token

## 💾 Database Schema

### Query Model
```javascript
{
  name: String (required),
  email: String (required),
  phone: String (required),
  message: String (required),
  userId: ObjectId (nullable),
  status: String (pending, resolved, in-progress) (default: pending),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

## 🔄 Service Architecture

### MongoDB
- Primary database for storing queries
- Connection via MongoDB Atlas

### Redis
- Caching layer for improving performance
- TTL: 1 hour for cached queries
- Key pattern: `query:{queryId}`

### RabbitMQ
- Message queue for async event processing
- Routing keys:
  - `query.created` - When query is created
  - `query.updated` - When query is updated
  - `query.deleted` - When query is deleted

## 🧪 Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import"
3. Upload the `postman_collection.json` file
4. Set environment variables:
   - `base_url`: http://localhost:4001
   - `token`: Your JWT token

### Test Workflow
1. Create a new query
2. Get all queries
3. Get query by ID
4. Update the query
5. Delete the query

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Command insert requires authentication
```
**Solution:** Verify MONGODB_URI in .env file includes credentials

### Redis Connection Error
```
Error: Redis connection failed
```
**Solution:** Check REDIS_URL format and ensure Redis server is running

### RabbitMQ Connection Error
```
Error: Could not connect to RabbitMQ
```
**Solution:** Ensure RabbitMQ is running on localhost:5672 or update RABBITMQ_URL

### JWT Token Invalid
```
Error: Invalid token
```
**Solution:** Generate a new token or check JWT_SECRET matches the token source

## 📞 Contact & Support

For issues or questions, contact the development team.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Version:** 1.0.0  
**Last Updated:** April 2, 2026  
**Author:** Query Services Team
