# PulseQueue

A distributed job processing system built with Node.js, Redis, and React.

PulseQueue is a mini distributed task queue inspired by systems like BullMQ, Celery, and Sidekiq.  
It supports asynchronous job execution, retries, delayed jobs, worker coordination, crash recovery, and real-time monitoring.

---

# Features

- Distributed worker architecture
- Priority queues
- Delayed jobs
- Retry system with exponential backoff
- Worker heartbeats
- Crash recovery
- Active job tracking
- Fault-tolerant processing
- Real-time queue monitoring
- Redis-backed persistence
- Dockerized infrastructure
- Horizontal worker scaling

---

# Tech Stack

## Backend

- Node.js
- Express.js
- Redis
- Socket.IO

## Frontend

- React
- MUI
- Recharts

## Infrastructure

- Docker
- Docker Compose

---

# System Architecture

```text
                ┌──────────────────┐
                │     Clients      │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    API Server    │
                │  Job Producer    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │      Redis       │
                │ Queue + Storage  │
                └────────┬─────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Worker 1 │   │ Worker 2 │   │ Worker 3 │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
             ┌─────────────────┐
             │ Retry Scheduler │
             └─────────────────┘
```

---

# Job Lifecycle

```text
WAITING
   │
   ▼
ACTIVE
   │
   ├──────────────► COMPLETED
   │
   ▼
FAILED
   │
   ▼
RETRY DELAY
   │
   ▼
WAITING
```

---

# Distributed Recovery Flow

```text
Worker Picks Job
        │
        ▼
Heartbeat Stops
        │
        ▼
Recovery Scanner Detects Dead Worker
        │
        ▼
Job Requeued Automatically
```

---

# Queue Priorities

PulseQueue supports multiple priority levels.

```text
HIGH
MEDIUM
LOW
```

Workers always process:

```text
HIGH → MEDIUM → LOW
```

---

# Retry System

PulseQueue implements exponential backoff retries.

## Formula

delay = baseDelay * 2^attempts

## Example

| Attempt | Delay |
|----------|------|
| 1 | 2s |
| 2 | 4s |
| 3 | 8s |
| 4 | 16s |

---

# Redis Data Structures

| Structure | Purpose |
|---|---|
| HASH | Job metadata |
| LIST | Waiting queues |
| SORTED SET | Delayed jobs |
| HASH | Worker heartbeats |

---

# Redis Keys

```text
jobs:data

queue:waiting:high
queue:waiting:medium
queue:waiting:low

queue:completed
queue:failed
queue:delayed

queue:active:jobs

workers:heartbeats
workers:jobs
```

---

# Monorepo Structure

```text
pulsequeue/
│
├── services/
│   ├── api-server/
│   ├── worker/
│   ├── scheduler/
│   └── dashboard/
│
├── packages/
│   ├── queue-core/
│   ├── redis-client/
│   └── shared/
│
├── docker/
│
├── docs/
│
└── docker-compose.yml
```

---

# Core Components

## API Server

Responsible for:

- Accepting jobs
- Validating payloads
- Pushing jobs into queues

---

## Worker Service

Responsible for:

- Polling queues
- Processing jobs
- Handling retries
- Sending heartbeats

---

## Scheduler Service

Responsible for:

- Delayed job scheduling
- Recovery scanning
- Dead worker detection

---

## Dashboard

Responsible for:

- Queue visualization
- Worker monitoring
- Real-time updates
- Failed job inspection

---

# Running Locally

## Clone Repository

```bash
git clone <repo-url>

cd pulsequeue
```

---

# Start Redis

```bash
docker compose up -d
```

---

# Start API

```bash
cd services/api-server

npm install

node src/index.js
```

---

# Start Worker

```bash
cd services/worker

npm install

node src/index.js
```

---

# Start Scheduler

```bash
cd services/scheduler

npm install

node src/index.js
```

---

# API Example

## Create Job

```http
POST /jobs
```

## Request Body

```json
{
  "type": "EMAIL",
  "payload": {
    "to": "test@gmail.com"
  },
  "priority": "HIGH"
}
```

---

# Example Job Object

```json
{
  "id": "job-123",
  "type": "EMAIL",
  "payload": {
    "to": "test@gmail.com"
  },
  "status": "WAITING",
  "priority": "HIGH",
  "attempts": 0,
  "maxAttempts": 3,
  "createdAt": 1747620000000
}
```

---

# Worker Coordination

PulseQueue uses worker heartbeats for distributed coordination.

## Heartbeat Flow

```text
Worker Starts
    │
    ▼
Heartbeat Every 5 Seconds
    │
    ▼
Recovery Scanner Monitors Workers
```

---

# Crash Recovery

If a worker crashes while processing:

```text
1. Heartbeat expires
2. Recovery scanner detects dead worker
3. Active job requeued
4. Another worker processes job
```

---

# Scalability

PulseQueue supports horizontal scaling.

Run multiple workers:

```bash
node src/index.js
```

across multiple terminals or containers.

---

# Future Improvements

- Atomic queue claiming
- BRPOPLPUSH implementation
- Rate limiting
- Job dependencies
- Dead letter queue dashboard
- Worker autoscaling
- Kubernetes deployment
- Metrics aggregation
- Prometheus integration
- OpenTelemetry tracing

---

# Engineering Concepts Learned

- Distributed systems
- Queueing systems
- Reliability engineering
- Fault tolerance
- Retry strategies
- Heartbeat coordination
- Recovery systems
- Async processing
- Event-driven architecture
- Worker orchestration
- Redis internals

---

# Inspired By

- BullMQ
- Celery
- Sidekiq
- AWS SQS
- RabbitMQ

---