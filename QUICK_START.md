# 🎯 Query Services - Quick Reference

## 🚀 Start Server (30 seconds)

```bash
npm run dev
```

**Expected output:**
```
✓ Connected to MongoDB successfully
✓ Connected to Redis
✓ Connected to RabbitMQ
✓ ALL SERVICES INITIALIZED SUCCESSFULLY
```

---

## 📱 Test Endpoints (Copy & Paste)

### Health Check
```bash
curl http://localhost:4001/health
```

### Create Query
```bash
curl -X POST http://localhost:4001/api/queries/user/create \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","phone":"123","message":"test"}'
```

### Get All Queries
```bash
curl http://localhost:4001/api/queries/all
```

### Get My Queries
```bash
curl http://localhost:4001/api/queries/user/my-queries \
  -H "Authorization: Bearer token123"
```

### Update Query
```bash
curl -X PUT http://localhost:4001/api/queries/user/update/QUERY_ID \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json" \
  -d '{"message":"Updated"}'
```

### Delete Query
```bash
curl -X DELETE http://localhost:4001/api/queries/user/delete/QUERY_ID \
  -H "Authorization: Bearer token123"
```

---

## 📊 Services Status

### MongoDB Atlas (Cloud)
- ✅ Connected via URL
- ✅ Database: query-servicesgood
- 📊 View data: MongoDB Compass or Atlas Dashboard

### Redis Cloud (Cache)
- ✅ Connected via URL
- ✅ TTL: 1 hour for queries
- 🔍 Check cache: `redis-cli KEYS query:*`

### RabbitMQ (Message Queue)
- ✅ Running on localhost:5672
- 📊 Admin: http://localhost:15672 (guest/guest)
- 📤 Queues: query_queue
- 📨 Exchange: query_exchange

---

## 🔧 Configuration

**File**: `.env`

```env
PORT=4001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
REDIS_URL=redis://default:password@host:port
JWT_SECRET=your-secret-key
```

---

## 📋 Request/Response Format

### Success Response (201)
```json
{
  "success": true,
  "message": "Query created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "My query",
    "status": "pending",
    "createdAt": "2026-04-02T10:30:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "All fields are required"
}
```

---

## 🔑 Authentication Header

```
Authorization: Bearer <any-token>
```

---

## 🌳 Project Files Structure

```
📁 query-services
├─ 📝 README.md          ← Full documentation
├─ 📝 SETUP.md           ← Installation guide
├─ 📝 TESTING.md         ← Testing guide
├─ 📝 CONFIGURATION.md   ← Config details
├─ 📝 QUICK_START.md     ← This file
├─ 📄 .env               ← Your config
├─ 📄 .env.example       ← Config template
├─ 📦 package.json       ← Dependencies
├─ 🔧 index.js           ← Server start
├─ 📁 src/
│  ├─ 📄 app.js
│  ├─ 📁 config/
│  │  ├─ db.js          ← MongoDB config
│  │  ├─ redis.js       ← Redis config
│  │  └─ rabbitmq.js    ← RabbitMQ config
│  ├─ 📁 controllers/
│  ├─ 📁 middleware/
│  ├─ 📁 models/
│  ├─ 📁 routes/
│  └─ 📁 services/
└─ 📮 postman_collection.json ← API collection
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port 4001 in use" | `lsof -i :4001` → `kill -9 <PID>` |
| "MongoDB connection error" | Check .env MONGODB_URI |
| "Redis connection failed" | Check REDIS_URL format |
| "RabbitMQ not connecting" | Ensure RabbitMQ is running |
| "Token invalid" | Use any string as token |

---

## ⚡ Performance Tips

- Use Redis for frequently accessed queries
- Enable pagination for large datasets
- Use admin filter by status for better performance
- Monitor RabbitMQ queue depth

---

## 🎮 Postman Setup (2 minutes)

1. **Import**: File → Import → `postman_collection.json`
2. **Configure Environment**:
   - `base_url`: http://localhost:4001
   - `token`: any-token
   - `admin_token`: admin-token
3. **Run**: Select folder → Run Collection

---

## 📊 Database Schema

```javascript
Query {
  _id: ObjectId,
  name: String,           // Required
  email: String,          // Required
  phone: String,          // Required
  message: String,        // Required
  userId: ObjectId,       // From auth token
  status: String,         // pending|in-progress|resolved
  createdAt: Date,        // Auto
  updatedAt: Date         // Auto
}
```

---

## 🚀 Deployment Checklist

- [ ] Update .env for production
- [ ] Set NODE_ENV=production
- [ ] Use secure JWT_SECRET
- [ ] Update RABBITMQ_URL (if cloud)
- [ ] Enable HTTPS
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Test all endpoints
- [ ] Setup database backups
- [ ] Configure auto-restart

---

## 📱 API URL Patterns

```
http://localhost:4001/api/queries/
  ├─ /all                           (GET)
  ├─ /user/create                   (POST)
  ├─ /user/my-queries               (GET)
  ├─ /user/:id                      (GET)
  ├─ /user/update/:id               (PUT)
  ├─ /user/delete/:id               (DELETE)
  ├─ /admin/all                     (GET)
  ├─ /admin/statistics              (GET)
  ├─ /admin/update/:id              (PUT)
  └─ /admin/delete/:id              (DELETE)
```

---

## ✨ Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| CRUD Operations | ✅ | Full support |
| Authentication | ✅ | JWT + fallback |
| Caching | ✅ | Redis (1hr TTL) |
| Message Queue | ✅ | RabbitMQ events |
| Cloud DB | ✅ | MongoDB Atlas |
| Pagination | ✅ | Admin endpoints |
| Role-based | ✅ | User/Admin |
| Error Handling | ✅ | Comprehensive |
| Logging | ✅ | Detailed output |
| Health Check | ✅ | `/health` endpoint |

---

## 📚 Documentation Links

- **Full Docs**: README.md
- **Setup Guide**: SETUP.md
- **Testing**: TESTING.md
- **Configuration**: CONFIGURATION.md
- **API Collection**: postman_collection.json

---

## 🎯 Next Action

```bash
npm run dev
```

Then test with Postman or cURL! 🚀

---

**Ready to go!** ✅
