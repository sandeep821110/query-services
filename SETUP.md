# 🚀 Quick Setup Guide - Query Services

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or login

2. **Create a Cluster**
   - Click "Create a Deployment"
   - Choose "Free" tier
   - Select your region
   - Click "Create Deployment"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `sandeepku821110` (your choice)
   - Password: Generate secure password
   - Click "Add User"

4. **Set Network Access**
   - Go to "IP Whitelist" (Network Access)
   - Click "Add IP Address"
   - Select "Allow from anywhere" (0.0.0.0/0) - for development
   - Click "Add IP"

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect"
   - Choose "Drivers"
   - Select "Node.js"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>`

## Step 3: Setup Redis Cloud

1. **Create Redis Cloud Account**
   - Go to https://redis.com/cloud
   - Sign up or login

2. **Create Database**
   - Click "Create free subscription"
   - Choose any deployment (free tier available)
   - Click "Create database"

3. **Get Connection URL**
   - Copy the Redis CLI connection string
   - Format: `redis://default:PASSWORD@host:port`

## Step 4: Configure Environment Variables

1. **Copy .env.example to .env**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file with your values:**
   ```env
   PORT=4001
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/query-services
   REDIS_URL=redis://default:password@host:port
   JWT_SECRET=Qw8vZ!2r@7pLx#1e$9sTg^4bHjKmNcRf
   JWT_EXPIRE=24h
   RABBITMQ_URL=amqp://localhost
   QUEUE_NAME=query_queue
   ```

## Step 5: Install RabbitMQ (Local)

### Option A: Using Docker
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Option B: Using Brew (Mac)
```bash
brew install rabbitmq
brew services start rabbitmq-server
```

### Option C: Using Windows Package
- Download from https://www.rabbitmq.com/download.html
- Run installer
- RabbitMQ runs automatically

**Access RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: guest
- Password: guest

## Step 6: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Step 7: Verify Setup

### Check Health Endpoint
```bash
curl http://localhost:4001/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Check Console Output
You should see:
```
✓ Connected to MongoDB successfully
✓ Connected to Redis
✓ Connected to RabbitMQ
✓ Message consumer started
✓ ALL SERVICES INITIALIZED SUCCESSFULLY
```

## Step 8: Test with Postman

### Create Query
**POST** `http://localhost:4001/api/queries/user/create`

Headers:
```
Authorization: Bearer any-token-here
Content-Type: application/json
```

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Test query message"
}
```

### Get All Queries
**GET** `http://localhost:4001/api/queries/all`

### Get Health
**GET** `http://localhost:4001/health`

## 🔍 Troubleshooting

### MongoDB Connection Failed
- Check MONGODB_URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username and password

### Redis Connection Failed
- Check REDIS_URL format
- Ensure Redis Cloud database is running
- Check credentials

### RabbitMQ Connection Failed
- Ensure RabbitMQ is running (Docker or local)
- Check RABBITMQ_URL is correct
- For cloud RabbitMQ, update RABBITMQ_URL

### Port Already in Use
```bash
# Find process on port 4001
lsof -i :4001

# Kill process
kill -9 <PID>
```

## 📱 Environment Variables Summary

| Variable | Example | Required |
|----------|---------|----------|
| PORT | 4001 | Yes |
| MONGODB_URI | mongodb+srv://user:pass@cluster.mongodb.net/db | Yes |
| REDIS_URL | redis://default:pass@host:port | Yes |
| JWT_SECRET | random-secret-key | Yes |
| RABBITMQ_URL | amqp://localhost | Yes |
| NODE_ENV | development | No |

## 🎯 Next Steps

1. Import Postman collection
2. Create test queries
3. Test all CRUD operations
4. Deploy to production

## 📚 Documentation

- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Redis Cloud: https://docs.redis.com/latest/
- RabbitMQ: https://www.rabbitmq.com/documentation.html
- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/

---

**Setup Complete!** 🎉

Your Query Services API is ready to use.
