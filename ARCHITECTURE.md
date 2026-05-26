# 🏗️ Query Services - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Postman    │  │   Browser    │  │   Mobile     │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           Express.js Server (Port 4001)                │     │
│  └────────┬──────────────────────────────────────────┬────┘     │
│           │                                          │           │
│  ┌────────▼───────────────┐   ┌─────────────────────▼────────┐  │
│  │  CORS & Compression    │   │  Body Parser & Logging       │  │
│  └────────┬───────────────┘   └─────────────────────┬────────┘  │
│           │                                         │            │
└───────────┼─────────────────────────────────────────┼────────────┘
            │                                         │
            ▼                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │         Authentication Middleware (JWT)                │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │ Extract & Validate Token → Extract User Info     │  │     │
│  │  │ Generate MongoDB ObjectId from Token             │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  └────────┬───────────────────────────────────────────────┘     │
│           │                                                     │
│  ┌────────▼───────────────────────────────────────────────┐     │
│  │         Role Middleware (User/Admin)                   │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │ Check user role → Allow/Deny access             │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  └────────┬───────────────────────────────────────────────┘     │
└───────────┼────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ROUTING LAYER                                  │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  User Routes    │  │ Admin Routes │  │  Public Routes  │    │
│  │                 │  │              │  │                 │    │
│  │ • create        │  │ • all        │  │ • /all          │    │
│  │ • my-queries    │  │ • stats      │  │ • /health       │    │
│  │ • :id           │  │ • update     │  │ • /             │    │
│  │ • update        │  │ • delete     │  │                 │    │
│  │ • delete        │  │              │  │                 │    │
│  └────────┬────────┘  └──────┬───────┘  └────────┬────────┘    │
└───────────┼────────────────────┼─────────────────┼──────────────┘
            │                    │                 │
            └────────────────────┼─────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Validate Input                                        │   │
│  │  • Process Business Logic                                │   │
│  │  • Call Services                                         │   │
│  │  • Format Response                                       │   │
│  └──────────────────────────────┬───────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│ QUERY SERVICE   │      │  CACHE SERVICE  │      │  QUEUE SRVR  │
│ (Database Ops)  │      │  (Redis Layer)  │      │(RabbitMQ)    │
│                 │      │                 │      │              │
│ • create()      │      │ • redisSet()    │      │ • publish()  │
│ • read()        │      │ • redisGet()    │      │ • consume()  │
│ • update()      │      │ • redisDel()    │      │ • process()  │
│ • delete()      │      │                 │      │              │
└────────┬────────┘      └────────┬────────┘      └───────┬──────┘
         │                        │                       │
         ▼                        ▼                       ▼
    ┌────────────┐           ┌─────────┐         ┌───────────────┐
    │  MongoDB   │           │ Redis   │         │   RabbitMQ    │
    │   Atlas    │           │ Cloud   │         │   (Local)     │
    │            │           │         │         │               │
    │ Queries DB │           │ 1hr TTL │         │ query.created │
    │            │           │ Cache   │         │ query.updated │
    │ Indexes:   │           │         │         │ query.deleted │
    │ • email    │           │ Keys:   │         │               │
    │ • userId   │           │ query:* │         │ Exchange:     │
    │ • status   │           │         │         │ query_exchange│
    │ • date     │           └─────────┘         │               │
    └────────────┘                               │ Queue:        │
                                                 │ query_queue   │
                                                 └───────────────┘
```

---

## Data Flow Diagrams

### Create Query Flow
```
CLIENT
  │
  POST /api/queries/user/create
  + name, email, phone, message
  + Authorization: Bearer token
  │
  ▼
AUTH MIDDLEWARE
  │
  Extract & validate token
  Generate user ObjectId
  │
  ▼
QUERY CONTROLLER
  │
  Validate required fields
  │
  ▼
QUERY SERVICE
  │
  ├─▶ MongoDB: Save query
  │   └─▶ Get _id from response
  │
  ├─▶ RabbitMQ: Publish event
  │   └─▶ query.created
  │
  └─▶ Redis: Cache query (1hr)
      └─▶ Key: query:{_id}
  │
  ▼
RESPONSE 201
{
  success: true,
  data: {_id, name, email, phone, message, status, ...}
}
```

### Get Query Flow (with Caching)
```
CLIENT
  │
  GET /api/queries/user/:id
  + Authorization: Bearer token
  │
  ▼
AUTH MIDDLEWARE
  │
  Extract & validate token
  │
  ▼
QUERY CONTROLLER
  │
  │
  ▼
QUERY SERVICE
  │
  ├─▶ Redis: Check cache
  │   │
  │   ├─ HIT: Return cached data
  │   │
  │   └─ MISS: ────┐
  │                │
  │   ┌────────────┘
  │   │
  │   ├─▶ MongoDB: Query database
  │   │   └─▶ Get full document
  │   │
  │   └─▶ Redis: Cache result (1hr)
  │       └─▶ Key: query:{_id}
  │
  ▼
RESPONSE 200
{
  success: true,
  data: {...query}
}
```

### Delete Query Flow
```
CLIENT
  │
  DELETE /api/queries/user/delete/:id
  + Authorization: Bearer token
  │
  ▼
AUTH MIDDLEWARE
  │
  Extract & validate token
  │
  ▼
QUERY CONTROLLER
  │
  ▼
QUERY SERVICE
  │
  ├─▶ MongoDB: Delete document
  │   └─▶ Verify deletion
  │
  ├─▶ RabbitMQ: Publish event
  │   └─▶ query.deleted
  │
  └─▶ Redis: Remove cache
      └─▶ DEL query:{_id}
  │
  ▼
RESPONSE 200
{
  success: true,
  message: "Query deleted successfully"
}
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND TECHNOLOGIES                      │
├─────────────────────────────────────────────────────┤
│ • REST API Calls                                    │
│ • JSON Request/Response                            │
│ • Bearer Token Authentication                      │
│ • Error Handling                                   │
└─────────────────────────────────────────────────────┘
                       ↓↑
┌─────────────────────────────────────────────────────┐
│         BACKEND - NODE.JS / EXPRESS.JS              │
├─────────────────────────────────────────────────────┤
│ • Express 5.x           - HTTP Server              │
│ • Mongoose 9.x          - MongoDB ORM              │
│ • Redis Client          - Cache Client             │
│ • AMQPLIB               - RabbitMQ Client          │
│ • Body-Parser           - Request Parser           │
│ • CORS                  - Cross-Origin Support     │
│ • Morgan                - HTTP Logging             │
│ • DotEnv                - Environment Config       │
│ • jsonwebtoken          - JWT Handling             │
└─────────────────────────────────────────────────────┘
                       ↓↑
┌─────────────────────────────────────────────────────┐
│        DATABASE & INFRASTRUCTURE LAYER              │
├─────────────────────────────────────────────────────┤
│ • MongoDB Atlas         - Primary Database         │
│ • Redis Cloud           - Caching Layer            │
│ • RabbitMQ (Local)      - Message Queue            │
│ • Redis Labs            - Cache Provider           │
└─────────────────────────────────────────────────────┘
```

---

## Component Interaction Map

```
┌──────────────────────────────────────────────────────┐
│              Express.js Application                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │         REQUEST PIPELINE                   │     │
│  ├────────────────────────────────────────────┤     │
│  │ 1. CORS Middleware                         │     │
│  │ 2. Body Parser Middleware                  │     │
│  │ 3. Authentication Middleware   ◄───┐       │     │
│  │ 4. Role Middleware              │   ▼       │     │
│  │ 5. Request Routing              │  JWT     │     │
│  │ 6. Handler/Controller           │ Secret   │     │
│  │ 7. Response Formatter           │          │     │
│  │                                  └──────────┤     │
│  └────────────────┬───────────────────────────┘     │
│                   │                                  │
│  ┌────────────────┴──────────────────────────┐      │
│  │  DATABASE OPERATIONS                      │      │
│  ├────────────────────────────────────────────┤      │
│  │ Model: queryModel                          │      │
│  └───────┬──────────────────────────▲─────────┘      │
│          │                          │                │
│  ┌───────▼────────────────┬─────────┴────┐          │
│  │ MongoDB Atlas          │ Mongoose ORM │          │
│  └────────────────────────┴────────────────┘         │
│                                                      │
│  ┌────────────────────────────────────────┐         │
│  │  CACHE OPERATIONS (Redis)              │         │
│  ├────────────────────────────────────────┤         │
│  │ • Set Cache (TTL: 1hr)                 │         │
│  │ • Get Cache                            │         │
│  │ • Delete Cache                         │         │
│  └────────────────────────────────────────┘         │
│                                                      │
│  ┌────────────────────────────────────────┐         │
│  │  MESSAGE QUEUE (RabbitMQ)              │         │
│  ├────────────────────────────────────────┤         │
│  │ • Publish Events                       │         │
│  │ • Consume Messages                     │         │
│  │ • Process Async Tasks                  │         │
│  └────────────────────────────────────────┘         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Request-Response Cycle

```
┌─────────────────────────────────────────────┐
│     CLIENT SENDS HTTP REQUEST               │
│  POST /api/queries/user/create              │
│  Headers: Authorization: Bearer <token>     │
│  Body: {name, email, phone, message}        │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     CORS & BODY PARSER MIDDLEWARE           │
│  • Check origin                             │
│  • Parse JSON body                          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     AUTH MIDDLEWARE                         │
│  • Extract Bearer token                     │
│  • Verify JWT (or hash fallback)            │
│  • Generate user ObjectId                   │
│  • Attach user to req.user                  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     ROUTE MATCHING                          │
│  • Find matching route handler              │
│  • Pass to controller                       │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     CONTROLLER LOGIC                        │
│  • Validate input fields                    │
│  • Call service layer                       │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     SERVICE LAYER                           │
│  • Create query document                    │
│  • Save to MongoDB                          │
│  • Publish to RabbitMQ                      │
│  • Cache in Redis                           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     FORMAT RESPONSE                         │
│  {                                          │
│    success: true,                           │
│    message: "Query created",                │
│    data: {...query}                         │
│  }                                          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│     SEND RESPONSE                           │
│  Status: 201 Created                        │
│  Headers: Content-Type: application/json    │
│  Body: {...}                                │
└─────────────────────────────────────────────┘
```

---

## Service Dependencies

```
Query Service
    ├─ Mongoose
    │   └─ MongoDB Atlas
    │
    ├─ Redis Client
    │   └─ Redis Cloud
    │
    ├─ RabbitMQ Client
    │   └─ RabbitMQ Server
    │
    ├─ Express
    │   ├─ CORS
    │   ├─ Body-Parser
    │   ├─ Morgan
    │   └─ Dotenv
    │
    └─ JWT
        ├─ jsonwebtoken
        └─ Crypto (MD5 fallback)
```

---

## Scalability Architecture

### Horizontal Scaling
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Instance 1     │  │  Instance 2     │  │  Instance 3     │
│  Port: 4001     │  │  Port: 4002     │  │  Port: 4003     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Balancer   │
                    │  (nginx/HAProxy) │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         ┌────────┐     ┌────────┐    ┌─────────┐
         │ MongoDB│     │ Redis  │    │RabbitMQ │
         │ Atlas  │     │ Cloud  │    │(Cluster)│
         └────────┘     └────────┘    └─────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────┐
│  HTTPS/TLS Encryption               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  CORS - Cross-Origin Protection     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  JWT Authentication                 │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Input Validation & Sanitization    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Role-Based Access Control          │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Rate Limiting                      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Secure Database Credentials        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Environment Variables Encryption   │
└─────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: April 2, 2026  
**Production Ready**: ✅ Yes
