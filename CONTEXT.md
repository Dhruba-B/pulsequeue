# PulseQueue — Project Context

## Overview

PulseQueue is a distributed job processing and observability platform inspired by:

* BullMQ
* Celery
* Sidekiq
* Temporal
* Trigger.dev

The project focuses heavily on:

* distributed systems
* reliability engineering
* event-driven architecture
* realtime observability
* worker orchestration
* infrastructure-grade frontend systems

This is NOT a CRUD application.

The system should feel like:

* Datadog
* Grafana
* Railway
* Temporal UI
* Trigger.dev dashboard

---

# Tech Stack

## Frontend

* React
* Vite
* Material UI (MUI)
* Lucide Icons
* Recharts
* Zustand
* Socket.IO Client

## Backend

* Node.js
* Express
* Redis
* Socket.IO
* ioredis

## Architecture

Monorepo structure:

pulsequeue/
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
│   └── shared/

JavaScript ONLY.
NO TypeScript.

All packages use:
"type": "module"

---

# Docker And Kubernetes Context

## Docker Compose

`docker-compose.yml` is the local full-stack container entry point.

It runs:

* `redis` from `redis:7-alpine`, exposed on `localhost:6379`
* `api-server`, built from root `Dockerfile.api`, exposed on `localhost:5000`
* `worker`, built from root `Dockerfile.worker`
* `scheduler`, built from root `Dockerfile.scheduler`
* `dashboard`, built from root `Dockerfile.dashboard`, exposed on `localhost:4173`

The root Dockerfiles are the correct Docker build path because services import shared monorepo code from `packages/`.

Important Compose environment:

* `REDIS_URL=redis://redis:6379`
* `WORKER_TYPE=GENERAL`
* `OLLAMA_HOST=http://host.docker.internal:11434`
* dashboard build args:
  * `VITE_API_URL=http://localhost:5000`
  * `VITE_SOCKET_URL=http://localhost:5000`

Scale local workers with:

```bash
docker compose up --build --scale worker=5
```

## Kubernetes

Kubernetes manifests live in `k8s/` and are applied through Kustomize:

```bash
kubectl apply -k k8s
```

The cluster namespace is `pulsequeue`.

Kubernetes deploys:

* Redis Deployment, ClusterIP Service, and `redis-data` PVC
* Ollama Deployment, ClusterIP Service, and `ollama-data` PVC
* API Server Deployment and ClusterIP Service on port `5000`
* Worker Deployment with 3 default replicas
* Worker HorizontalPodAutoscaler from 1 to 10 replicas at 70% CPU
* Scheduler Deployment
* Dashboard Deployment and ClusterIP Service on port `80`

Shared non-secret configuration is in `k8s/configmap.yaml`.

Sensitive values belong in a real `pulsequeue-secrets` Secret. `k8s/secret.template.yaml` is a template and is intentionally not included in `k8s/kustomization.yaml`.

Local access uses port-forwarding:

```bash
kubectl port-forward -n pulsequeue svc/dashboard 4173:80
kubectl port-forward -n pulsequeue svc/api-server 5000:5000
```

Detailed Kubernetes instructions are in `docs/kubernetes.md`.

---

# System Architecture

## Current Distributed Flow

Client
↓
API Server
↓
Redis Queue
↓
Workers
↓
Redis Pub/Sub
↓
API Subscriber
↓
Socket.IO
↓
Realtime Dashboard

---

# Core Features Already Implemented

## Queue Features

* workers
* retries
* delayed jobs
* priority jobs
* job persistence
* Redis-backed queue
* scheduler service

## Dashboard Features

* realtime observability dashboard
* worker monitoring
* jobs monitoring
* failed jobs page
* live activity feed
* Socket.IO realtime updates

## Event Architecture

Workers DO NOT directly import API runtime.

Correct architecture:
Workers
→ Redis Pub/Sub
→ API Subscriber
→ Socket.IO
→ Frontend

This service boundary MUST remain respected.

---

# Frontend Design System

## Design Direction

The frontend is infrastructure-grade.

It should feel like:

* observability tooling
* cloud infrastructure platform
* distributed systems control plane

NOT:

* admin template
* CRUD panel
* generic SaaS dashboard

---

# Visual Style

## Aesthetic

* dark glassmorphism
* soft glow effects
* infra-dashboard styling
* high readability
* premium dark UI
* realtime operational feel

## Typography

Primary:

* Syne

Monospace:

* Space Mono

## Color Palette

Background:
#080B10

Primary Accent:
#00C8FF

Success:
#00E5A0

Warning:
#FFB800

Error:
#FF4D6A

Secondary:
#7B8CDE

## UI Patterns

Cards:

* translucent glass cards
* subtle borders
* soft glow hover
* rounded corners (20px-24px)

Layouts:

* fixed dashboard shell
* scrollable independent panels
* realtime activity sidebar
* operational metrics grid

---

# Frontend Standards

ALL newly generated pages/components MUST:

* match existing observability aesthetic
* be fully responsive
* support realtime updates
* use reusable components
* avoid inline duplication
* use scalable architecture
* feel production-grade

---

# Existing Frontend Structure

src/
├── api/
├── hooks/
├── store/
├── pages/
├── components/
│   ├── layout/
│   ├── workers/
│   ├── tables/
│   ├── activity/
│   └── common/

---

# Existing Pages

* DashboardPage
* JobsPage
* WorkersPage
* FailedJobsPage

---

# Existing Components

* WorkerCard
* JobsTable
* ActivityFeed
* StatusChip
* Sidebar
* Topbar
* MainLayout

---

# Realtime System

Socket.IO events currently include:

* job_created
* job_completed
* job_failed
* worker_updated

Realtime updates are CRITICAL to the UX.

---

# Backend Standards

## API Design

* RESTful
* modular controllers/services
* scalable architecture
* clean separation of concerns

## Redis Usage

Redis is used for:

* queue backend
* job persistence
* pub/sub event bus
* worker heartbeats
* retries
* delayed jobs

## IMPORTANT

Never tightly couple services together.
Use:

* Redis Pub/Sub
* queues
* events
* sockets

instead of runtime imports across services.

---

# Code Quality Expectations

Generated code must:

* be production-quality
* avoid placeholders
* avoid fake mock architecture
* include proper error handling
* include loading states
* include empty states
* include responsive behavior
* include scalable component architecture

---

# Current Goal

PulseQueue is evolving into a:

* distributed systems platform
* observability dashboard
* realtime queue orchestration tool

All future additions should reinforce:

* infrastructure tooling feel
* distributed systems realism
* operational UX
* realtime monitoring experience
