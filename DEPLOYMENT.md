# 📦 Production Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All endpoints tested and working
- [ ] Error handling implemented
- [ ] Sensitive data removed from code
- [ ] Console.log statements cleaned up
- [ ] Dependencies are up to date

### Security
- [ ] Strong JWT_SECRET set (min 32 chars)
- [ ] MongoDB credentials secure
- [ ] Redis credentials updated
- [ ] RabbitMQ configured with credentials
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] No hardcoded secrets in code

### Performance
- [ ] Redis caching enabled
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Rate limiting implemented
- [ ] Monitoring set up

### Infrastructure
- [ ] MongoDB Atlas backup enabled
- [ ] Redis persistence enabled
- [ ] RabbitMQ clustering (if needed)
- [ ] Load balancer configured
- [ ] Database replication enabled

---

## Environment Configuration

### Production .env

```env
# ============================================================
# PRODUCTION CONFIGURATION
# ============================================================

# Server
PORT=4001
NODE_ENV=production

# MongoDB Atlas (Production Database)
MONGODB_URI=mongodb+srv://prod_user:secure_password@cluster-prod.mongodb.net/query-services-prod

# Redis Cloud (Production Cache)
REDIS_URL=redis://default:secure_password@redis-prod.region.ec2.cloud.redislabs.com:12345

# JWT Configuration (IMPORTANT: Change this!)
JWT_SECRET=Generate_a_very_strong_random_string_here_at_least_32_chars
JWT_EXPIRE=24h

# RabbitMQ Production
RABBITMQ_URL=amqp://prod_user:secure_password@rabbitmq-prod-host:5672/vhost

QUEUE_NAME=query_queue

# ============================================================
# Optional: Logging & Monitoring
# ============================================================
LOG_LEVEL=info
SENTRY_DSN=https://your_sentry_key@sentry.io/project_id
```

---

## Deployment Options

### Option 1: Heroku

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Create Heroku App
```bash
heroku create query-services-app
```

#### 3. Add Buildpack
```bash
heroku buildpacks:add heroku/nodejs
```

#### 4. Set Environment Variables
```bash
heroku config:set PORT=4001
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set REDIS_URL="redis://..."
heroku config:set JWT_SECRET="your_strong_secret"
heroku config:set RABBITMQ_URL="amqp://..."
```

#### 5. Deploy
```bash
git push heroku main
```

#### 6. View Logs
```bash
heroku logs --tail
```

---

### Option 2: Docker Containerization

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE ${PORT}

CMD ["node", "index.js"]
```

#### Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
```

#### Build and Push

```bash
# Build image
docker build -t query-services:1.0.0 .

# Tag for registry (e.g., Docker Hub)
docker tag query-services:1.0.0 yourregistry/query-services:1.0.0

# Push
docker push yourregistry/query-services:1.0.0
```

#### Run Container
```bash
docker run -d \
  -p 4001:4001 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e REDIS_URL="redis://..." \
  -e JWT_SECRET="your_secret" \
  query-services:1.0.0
```

---

### Option 3: DigitalOcean App Platform

#### 1. Create app.yaml

```yaml
name: query-services
services:
- name: api
  github:
    repo: your-github/query-services
    branch: main
  build_command: npm install
  run_command: npm start
  http_port: 4001
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "4001"
  - key: MONGODB_URI
    value: ${DB_MONGODB_URI}
  - key: REDIS_URL
    value: ${DB_REDIS_URI}
  - key: JWT_SECRET
    value: ${JWT_SECRET}
```

#### 2. Deploy

```bash
# Install doctl CLI
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec app.yaml
```

---

### Option 4: AWS Elastic Beanstalk

#### 1. Install EB CLI
```bash
pip install awsebcli
```

#### 2. Initialize
```bash
eb init -p "Node.js 18 running on 64bit Amazon Linux 2"
```

#### 3. Create Environment
```bash
eb create query-services-env
```

#### 4. Set Environment Variables
```bash
eb setenv MONGODB_URI="mongodb+srv://..."
eb setenv REDIS_URL="redis://..."
eb setenv JWT_SECRET="your_secret"
```

#### 5. Deploy
```bash
eb deploy
```

---

## Performance Optimization

### 1. Enable Gzip Compression

```javascript
// In src/app.js
import compression from 'compression';

app.use(compression());
```

### 2. Implement Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Database Indexing

```javascript
// In queryModel.js
querySchema.index({ email: 1 });
querySchema.index({ userId: 1 });
querySchema.index({ status: 1 });
querySchema.index({ createdAt: -1 });
```

### 4. Connection Pooling

```javascript
// Already configured in db.js
const mongoOptions = {
    maxPoolSize: 10,
    minPoolSize: 2
};
```

---

## Monitoring & Logging

### 1. Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```javascript
// In index.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.errorHandler());
```

### 2. Winston (Logging)

```bash
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. PM2 (Process Management)

```bash
npm install pm2 -g
```

```bash
pm2 start index.js --name query-services
pm2 save
pm2 startup
```

---

## Health Checks & Auto-Healing

### Implement Health Endpoint
```javascript
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'Server running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.isOpen ? 'connected' : 'disconnected',
    timestamp: new Date()
  };
  res.status(200).json(health);
});
```

### Configure Load Balancer Health Checks
```
Path: /health
Interval: 30 seconds
Timeout: 5 seconds
Unhealthy threshold: 3
```

---

## Database Backups

### MongoDB Atlas Automated Backups
1. Go to MongoDB Atlas Dashboard
2. Click "Backup"
3. Enable "Automatic Backup" (default: daily)
4. Set retention policy (30 days recommended)

### Manual Backup
```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/query-services" --out ./backup
```

---

## Scaling Strategy

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Run multiple server instances
- Redis handles distributed cache
- RabbitMQ ensures message delivery

### Vertical Scaling
- Increase server resources
- Upgrade MongoDB tier
- Increase Redis memory
- Add RabbitMQ consumers

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
brew install certbot

# Generate certificate
certbot certonly --standalone -d your-domain.com

# Certificates location:
# /etc/letsencrypt/live/your-domain.com/
```

### Configure Node.js

```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

---

## CDN Configuration

### Using CloudFront (AWS)
1. Create CloudFront distribution
2. Set origin to ELB/ALB
3. Configure caching rules
4. Enable compression
5. Set TTL for static content

---

## Monitoring Dashboard

### Key Metrics to Monitor
- Request/response time
- Error rate
- Database query time
- Cache hit rate
- Queue depth
- Server uptime
- Memory usage
- CPU usage
- Network bandwidth

### Recommended Tools
- Prometheus + Grafana
- New Relic
- Datadog
- CloudWatch (AWS)

---

## Disaster Recovery

### Backup Strategy
```
Daily:   MongoDB automated backup
Weekly:  Full manual backup
Monthly: Off-site backup copy
```

### Recovery Plan
1. Verify backup integrity
2. Test restore procedure
3. Document recovery steps
4. Practice recovery quarterly

---

## Security Hardening

### Headers
```javascript
import helmet from 'helmet';
app.use(helmet());
```

### CORS
```javascript
import cors from 'cors';
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### SQL Injection Prevention
- Use Mongoose schemas (prevents NoSQL injection)
- Validate all inputs
- Use parameterized queries

### DDoS Protection
- Use CloudFlare or AWS Shield
- Enable rate limiting
- Configure WAF rules

---

## Maintenance Window Template

```
Scheduled Maintenance
Date: [DATE]
Time: [TIME] UTC
Duration: [DURATION]
Impact: API will be unavailable

Changes:
- [CHANGE 1]
- [CHANGE 2]

Status Updates: @status_page
```

---

## Rollback Procedure

### If deployment fails:
1. Revert code to previous version
2. Restart application
3. Verify health checks pass
4. Notify team
5. Post-mortem analysis

```bash
git revert <commit-hash>
npm install
pm2 restart query-services
```

---

## Post-Deployment Verification

- [ ] Health endpoint returns 200
- [ ] Can create query
- [ ] Can retrieve query
- [ ] Cache is working
- [ ] Message queue processing
- [ ] Logs are being generated
- [ ] Backups are running
- [ ] Monitoring is active

---

**Your Query Services is production-ready!** 🚀
