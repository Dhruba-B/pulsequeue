# ⚡ PulseQueue

> **Distributed AI execution infrastructure — built from first principles.**

PulseQueue is a cloud-native distributed AI execution platform featuring:

* specialized AI workers
* capability-based scheduling
* local LLM inference
* OCR execution
* embedding generation
* distributed orchestration
* realtime observability
* fault-tolerant queue coordination

Built using Redis-backed distributed systems concepts inspired by:

* BullMQ
* Celery
* Sidekiq
* Temporal
* Ray
* Modal
* RunPod

---

# 🚀 Evolution

PulseQueue originally began as a distributed job processing system.

It has now evolved into:

# Distributed AI Execution Infrastructure

The platform focuses on:

* AI orchestration
* distributed inference execution
* specialized worker clusters
* realtime AI observability
* cloud-native execution pipelines

NOT:

* chatbot wrappers
* generic AI SaaS
* CRUD admin dashboards

---

# 🧠 AI Capabilities

PulseQueue currently supports:

| AI Job Type | Runtime             |
| ----------- | ------------------- |
| `SUMMARIZE` | Ollama local LLM    |
| `TRANSLATE` | Ollama local LLM    |
| `OCR`       | Tesseract OCR       |
| `EMBED`     | Xenova Transformers |
| `CLASSIFY`  | Local inference     |

---

# 🏗️ Core Architecture

```text
                    Clients
                       │
                       ▼
                 API Gateway
                       │
                       ▼
                     Redis
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼

   LLM Workers     OCR Workers    Embed Workers
        │              │              │
        ▼              ▼              ▼

    Ollama         Tesseract      Xenova
    Runtime            OCR       Embeddings
```

---

# ⚡ Distributed Worker Model

PulseQueue uses:

# Capability-Based Worker Routing

Workers advertise supported execution capabilities.

Examples:

| Worker Type | Capabilities                         |
| ----------- | ------------------------------------ |
| `LLM`       | `SUMMARIZE`, `TRANSLATE`, `CLASSIFY` |
| `OCR`       | `OCR`                                |
| `EMBED`     | `EMBED`                              |
| `GENERAL`   | All capabilities                     |

Workers ONLY claim compatible jobs from priority queues.

This enables:

* specialized execution
* heterogeneous worker clusters
* future GPU routing
* intelligent scheduling
* execution isolation

---

# 🧩 Stack

## Frontend

* React
* MUI
* Socket.IO
* Recharts

## Backend

* Node.js
* Express
* Redis

## AI Runtime

* Ollama
* Tesseract.js
* Xenova Transformers

## Infrastructure

* Docker Compose
* Distributed workers
* Realtime telemetry

---

# 🔥 Features

| Capability                      | Detail                                                    |
| ------------------------------- | --------------------------------------------------------- |
| **Distributed AI Workers**      | Horizontally scalable specialized worker clusters         |
| **Capability-Based Scheduling** | Workers claim only compatible AI jobs                     |
| **Priority Queues**             | `HIGH → MEDIUM → LOW` execution ordering                  |
| **Local AI Inference**          | Ollama-powered LLM execution without cloud API dependency |
| **OCR Execution**               | Distributed OCR workers using Tesseract                   |
| **Embedding Generation**        | Local embedding inference using Xenova                    |
| **Realtime Observability**      | Live execution telemetry via Socket.IO                    |
| **Crash Recovery**              | Automatic orphaned job recovery                           |
| **Retry System**                | Exponential backoff retry handling                        |
| **Distributed Coordination**    | Redis-backed worker orchestration                         |
| **AI Execution Monitoring**     | Worker capabilities, inference timing, queue telemetry    |

---

# 📊 AI Execution Lifecycle

```text
QUEUED
   ↓
ROUTED TO CAPABLE WORKER
   ↓
INFERENCE STARTED
   ↓
ACTIVE EXECUTION
   ↓
COMPLETED
```

Failure flow:

```text
FAILED
   ↓
EXPONENTIAL BACKOFF
   ↓
RETRY
   ↓
DEAD LETTER
```

---

# 🧠 AI Execution Examples

## Summarization Job

```json
{
  "type": "SUMMARIZE",

  "payload": {
    "text": "Redis is an in-memory data structure store..."
  },

  "priority": "HIGH"
}
```

---

## OCR Job

```json
{
  "type": "OCR",

  "payload": {
    "imageUrl": "https://..."
  }
}
```

---

## Embedding Job

```json
{
  "type": "EMBED",

  "payload": {
    "text": "Distributed AI systems"
  }
}
```

---

# 🧠 AI Result Persistence

Completed AI executions store:

* inference outputs
* execution metadata
* worker assignment
* timing metrics
* retry information

Examples:

* summaries
* OCR text
* embedding metadata
* translated content
* classification labels

---

# 📡 Realtime Observability

PulseQueue includes a realtime observability dashboard featuring:

* live queue telemetry
* worker monitoring
* AI execution streams
* inference metrics
* worker capabilities
* execution timelines
* active job tracking
* distributed worker health

Designed to feel similar to:

* Trigger.dev
* Modal
* RunPod
* Ray Dashboard

---

# 🗂️ Redis Data Model

| Structure              | Purpose                   |
| ---------------------- | ------------------------- |
| `jobs:data`            | AI job metadata           |
| `queue:waiting:*`      | Priority execution queues |
| `queue:delayed`        | Scheduled jobs            |
| `workers:heartbeats`   | Worker liveness           |
| `workers:capabilities` | Capability registry       |
| `queue:completed`      | Execution audit log       |
| `queue:failed`         | Dead letter queue         |

---

# 📁 Monorepo Structure

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
│   ├── ai-core/
│   ├── queue-core/
│   ├── redis-client/
│   ├── metrics/
│   └── shared/
│
├── docker/
├── docker-compose.yml
└── README.md
```

---

# 🚀 Quick Start

## 1. Clone Repository

```bash
git clone <repo-url>

cd pulsequeue
```

---

## 2. Start Redis

```bash
docker compose up -d
```

---

## 3. Install Ollama

Download:
https://ollama.com

Pull model:

```bash
ollama pull qwen2.5:3b
```

---

## 4. Start Services

```bash
node services/api-server/src/index.js

node services/scheduler/src/index.js
```

---

## 5. Start Specialized Workers

## LLM Worker

```bash
WORKER_TYPE=LLM node services/worker/src/index.js
```

## OCR Worker

```bash
WORKER_TYPE=OCR node services/worker/src/index.js
```

## EMBED Worker

```bash
WORKER_TYPE=EMBED node services/worker/src/index.js
```

---

# 🧠 Engineering Concepts

* Distributed systems
* AI orchestration
* Capability routing
* Queueing theory
* Reliability engineering
* Fault tolerance
* Event-driven architecture
* Worker specialization
* Realtime telemetry
* Distributed inference execution
* AI observability
* Local inference infrastructure

---

# 🔮 Future Roadmap

* [ ] GPU worker orchestration
* [ ] Kubernetes autoscaling
* [ ] AI execution DAG pipelines
* [ ] Vector database integration
* [ ] OpenTelemetry tracing
* [ ] Prometheus metrics
* [ ] Distributed inference batching
* [ ] Multi-model scheduling
* [ ] AI pipeline execution graphs
* [ ] Autoscaled worker pools

---

# ⚡ Vision

PulseQueue is evolving toward:

# Cloud-native Distributed AI Execution Infrastructure

Focused on:

* distributed inference
* specialized execution runtimes
* AI worker orchestration
* realtime observability
* scalable local AI infrastructure
