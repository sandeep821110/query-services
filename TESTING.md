# 🧪 Testing Guide - Query Services API

## Quick Start - First Test (2 minutes)

### 1. Start the Server
```bash
npm run dev
```

### 2. Test Health Endpoint
```bash
curl http://localhost:4001/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 3. Create Your First Query
```bash
curl -X POST http://localhost:4001/api/queries/user/create \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "This is a test query"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Query created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "This is a test query",
    "userId": "abc123def456...",
    "status": "pending",
    "createdAt": "2026-04-02T10:30:00.000Z",
    "updatedAt": "2026-04-02T10:30:00.000Z"
  }
}
```

---

## Comprehensive Testing Guide

### Using Postman (Recommended)

#### 1. Import Collection
1. Open Postman
2. Click `File` → `Import`
3. Select `postman_collection.json` from the project
4. Click `Import`

#### 2. Set Variables
In Postman:
1. Click the "Collections" tab
2. Find "Query Services API"
3. Right-click → "Edit"
4. Go to "Variables" tab
5. Set values:
   - `base_url`: http://localhost:4001
   - `token`: any-token-string
   - `admin_token`: any-token-with-admin-in-it
   - `query_id`: (copy from first create response)

#### 3. Run Requests
- Health Check → Get All Queries → Create Query → Get Query by ID → Update Query → Delete Query

---

### Using cURL (Terminal)

#### Test Health
```bash
curl -X GET http://localhost:4001/health
```

#### Create Query
```bash
curl -X POST http://localhost:4001/api/queries/user/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "My query message"
  }'
```

#### Get All Queries
```bash
curl -X GET http://localhost:4001/api/queries/all
```

#### Get Specific Query
```bash
# Replace QUERY_ID with actual ID
curl -X GET http://localhost:4001/api/queries/user/QUERY_ID \
  -H "Authorization: Bearer token"
```

#### Update Query
```bash
curl -X PUT http://localhost:4001/api/queries/user/update/QUERY_ID \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated message",
    "status": "in-progress"
  }'
```

#### Delete Query
```bash
curl -X DELETE http://localhost:4001/api/queries/user/delete/QUERY_ID \
  -H "Authorization: Bearer token"
```

#### Get Admin Statistics
```bash
curl -X GET http://localhost:4001/api/queries/admin/statistics \
  -H "Authorization: Bearer admin-token"
```

---

### Using Node.js / JavaScript

#### Create Test Script
Create `test.js`:

```javascript
const BASE_URL = 'http://localhost:4001';
const TOKEN = 'test-token';

async function runTests() {
  try {
    // 1. Health Check
    console.log('🏥 Testing Health Endpoint...');
    let res = await fetch(`${BASE_URL}/health`);
    console.log(await res.json());

    // 2. Create Query
    console.log('\n📝 Creating Query...');
    res = await fetch(`${BASE_URL}/api/queries/user/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'Test query'
      })
    });
    const query = await res.json();
    console.log(query);
    const queryId = query.data._id;

    // 3. Get All Queries
    console.log('\n📚 Getting All Queries...');
    res = await fetch(`${BASE_URL}/api/queries/all`);
    console.log(await res.json());

    // 4. Get Single Query
    console.log('\n🔍 Getting Single Query...');
    res = await fetch(`${BASE_URL}/api/queries/user/${queryId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log(await res.json());

    // 5. Update Query
    console.log('\n✏️  Updating Query...');
    res = await fetch(`${BASE_URL}/api/queries/user/update/${queryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Updated message',
        status: 'in-progress'
      })
    });
    console.log(await res.json());

    // 6. Delete Query
    console.log('\n🗑️  Deleting Query...');
    res = await fetch(`${BASE_URL}/api/queries/user/delete/${queryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log(await res.json());

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

runTests();
```

Run the test:
```bash
node test.js
```

---

## Test Scenarios

### Scenario 1: User Complete Flow

1. **Create Query**
   - Input: Valid user data
   - Expected: 201 with query ID

2. **Get My Queries**
   - Expected: Array with the created query

3. **Get Query by ID**
   - Input: Query ID from step 1
   - Expected: Full query object

4. **Update Query**
   - Input: Updated message/status
   - Expected: 200 with updated data

5. **Delete Query**
   - Expected: 200 with deleted query

### Scenario 2: Error Handling

1. **Missing Required Fields**
   ```bash
   curl -X POST http://localhost:4001/api/queries/user/create \
     -H "Authorization: Bearer token" \
     -H "Content-Type: application/json" \
     -d '{"name": "John"}'
   ```
   - Expected: 400 "All fields are required"

2. **Missing Authentication**
   ```bash
   curl -X POST http://localhost:4001/api/queries/user/create \
     -H "Content-Type: application/json" \
     -d '{"name": "John", "email": "j@test.com", "phone": "123", "message": "test"}'
   ```
   - Expected: 401 "No token provided"

3. **Invalid Query ID**
   ```bash
   curl -X GET http://localhost:4001/api/queries/user/invalid-id \
     -H "Authorization: Bearer token"
   ```
   - Expected: 400 or 404

### Scenario 3: Admin Operations

1. **Get All with Pagination**
   ```bash
   curl -X GET "http://localhost:4001/api/queries/admin/all?page=1&limit=5&status=pending" \
     -H "Authorization: Bearer admin-token"
   ```

2. **Get Statistics**
   ```bash
   curl -X GET http://localhost:4001/api/queries/admin/statistics \
     -H "Authorization: Bearer admin-token"
   ```

3. **Admin Update**
   ```bash
   curl -X PUT http://localhost:4001/api/queries/admin/update/QUERY_ID \
     -H "Authorization: Bearer admin-token" \
     -H "Content-Type: application/json" \
     -d '{"status": "resolved"}'
   ```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench (Mac)
brew install httpd

# Single request test
ab -n 1 -c 1 http://localhost:4001/health

# Load test: 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:4001/api/queries/all

# Results show:
# - Requests per second
# - Time per request
# - Throughput
```

---

## Monitoring

### Check MongoDB Queries
```bash
mongosh
use query-services
db.queries.find().pretty()
```

### Check Redis Cache
```bash
redis-cli
KEYS query:*
GET query:507f1f77bcf86cd799439011
```

### Check RabbitMQ
```
Open: http://localhost:15672
Username: guest
Password: guest
```

---

## Debugging

### Enable Detailed Logging
Add to .env:
```env
DEBUG=query:*
LOG_LEVEL=debug
```

### Check Server Logs
Server should show:
```
✓ Connected to MongoDB successfully
✓ Connected to Redis
✓ Connected to RabbitMQ
✓ Message consumer started
```

### Network Debugging
```bash
# Monitor network requests in Postman
# In Postman Console: Cmd+Alt+C (Mac) or Ctrl+Alt+C (Windows)
```

---

## Success Indicators

✅ All endpoints return correct status codes  
✅ Authentication works with token  
✅ CRUD operations complete successfully  
✅ Pagination works in admin endpoints  
✅ Error responses are informative  
✅ Redis caching is working  
✅ RabbitMQ messages are processed  
✅ Performance is acceptable  

---

## Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "Address already in use"
```bash
lsof -i :4001
kill -9 <PID>
```

### MongoDB connection timeout
- Check MONGODB_URI
- Verify IP whitelist in MongoDB Atlas
- Test connection with MongoDB Compass

### Redis connection failed
- Check REDIS_URL format
- Verify Redis credentials
- Test with redis-cli

### RabbitMQ not working
- Ensure RabbitMQ is running
- Check RABBITMQ_URL
- Access management UI: http://localhost:15672

---

**Happy Testing!** 🎉
