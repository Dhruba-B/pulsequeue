# ⚡ PulseQueue

> **Distributed job processing — built from first principles.**

A production-inspired task queue system featuring asynchronous job execution, priority scheduling, exponential backoff retries, distributed worker coordination via heartbeats, and automated crash recovery — backed by Redis, containerized with Docker.

*Inspired by BullMQ · Celery · Sidekiq · AWS SQS · RabbitMQ*

---

## Stack

`Node.js` `Express` `Redis` `Socket.IO` `React` `MUI` `Recharts` `Docker Compose`

---

## What's Built

| Capability | Detail |
|---|---|
| **Distributed Workers** | Horizontally scalable pool — N workers across containers, each polling Redis independently |
| **Priority Queues** | Three-tier scheduling: `HIGH → MEDIUM → LOW`, workers always drain higher tiers first |
| **Delayed Jobs** | Redis Sorted Set keyed by scheduled timestamp; scheduler promotes when ready |
| **Exponential Backoff** | `delay = base × 2ⁿ` — prevents thundering herd on downstream failures |
| **Heartbeat Coordination** | Workers emit to `workers:heartbeats` every 5s; stale entries trigger recovery |
| **Crash Recovery** | Orphaned jobs auto-requeued — zero manual intervention required |
| **Real-time Dashboard** | React + Socket.IO — live queue depths, worker status, job inspection |
| **Fault-tolerant Persistence** | All state in Redis — survives worker restarts, partial outages |

---

## System Architecture

```
          Clients
             │
             ▼
        API Server          ← Job ingestion · Express · validation
             │
             ▼
           Redis             ← Queue storage · persistence · coordination
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
 Worker 1  Worker 2  Worker N   ← Horizontal scale · poll · process · heartbeat
    └────────┼────────┘
             ▼
         Scheduler           ← Delayed job promotion · crash recovery · dead worker detection
```

---

## Job Lifecycle

```
WAITING → ACTIVE → COMPLETED
                ↘
              FAILED → RETRY DELAY → WAITING (up to maxAttempts)
```

Jobs are persisted as Redis `HASH` objects and transition atomically through states.

---

## Retry System

Formula: `delay = baseDelay × 2^attempts`

| Attempt | Delay |
|---|---|
| 1 | 2s |
| 2 | 4s |
| 3 | 8s |
| 4 | 16s |

After `maxAttempts`, the job is moved to `queue:failed` for inspection.

---

## Distributed Crash Recovery

```
1. Worker picks up job → heartbeat starts (every 5s → workers:heartbeats)
2. Worker crashes mid-processing → heartbeat stops
3. Scheduler detects stale heartbeat (threshold: 15s)
4. Orphaned job requeued → next healthy worker picks it up
```

No job is ever silently lost. Every active job has a registered owner; every owner has a heartbeat.

---

## Redis Data Model

| Structure | Key | Purpose |
|---|---|---|
| `HASH` | `jobs:data` | Job metadata and state |
| `LIST` | `queue:waiting:{high\|medium\|low}` | Priority FIFO queues |
| `SORTED SET` | `queue:delayed` | Scheduled future jobs (score = run-at timestamp) |
| `HASH` | `workers:heartbeats` | Worker liveness tracking |
| `LIST` | `queue:completed` | Audit log |
| `LIST` | `queue:failed` | Dead letter inspection |

---

## API

### Enqueue a Job

```http
POST /jobs
Content-Type: application/json

{
  "type": "EMAIL",
  "payload": { "to": "user@example.com" },
  "priority": "HIGH"
}
```

### Job Object

```json
{
  "id": "job-123",
  "type": "EMAIL",
  "payload": { "to": "user@example.com" },
  "status": "WAITING",
  "priority": "HIGH",
  "attempts": 0,
  "maxAttempts": 3,
  "createdAt": 1747620000000
}
```

---

## Monorepo Structure

```
pulsequeue/
│
├── services/
│   ├── api-server/      ← Job ingestion and validation
│   ├── worker/          ← Poll, process, heartbeat, retry
│   ├── scheduler/       ← Delayed job promotion + crash recovery
│   └── dashboard/       ← React monitoring UI
│
├── packages/
│   ├── queue-core/      ← Shared queue abstractions
│   ├── redis-client/    ← Connection management
│   └── shared/          ← Types, constants, schemas
│
├── docker/
├── docker-compose.yml
└── README.md
```

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd pulsequeue

# 2. Start Redis
docker compose up -d

# 3. Start services
cd services/api-server  && npm install && node src/index.js
cd services/worker      && npm install && node src/index.js
cd services/scheduler   && npm install && node src/index.js

# 4. Scale workers horizontally — just run more
node src/index.js   # terminal 2
node src/index.js   # terminal 3
```

---

## Engineering Concepts

`Distributed systems` · `Queueing theory` · `Reliability engineering` · `Fault tolerance`
`Heartbeat coordination` · `Crash recovery` · `Exponential backoff` · `Async processing`
`Event-driven architecture` · `Worker orchestration` · `Redis internals`

---

## Future Roadmap

- [ ] Atomic queue claiming via `BRPOPLPUSH`
- [ ] Rate limiting per job type
- [ ] Job dependency graphs
- [ ] Dead letter queue dashboard UI
- [ ] Prometheus metrics + Grafana dashboards
- [ ] OpenTelemetry distributed tracing
- [ ] Kubernetes deployment with worker autoscaling
