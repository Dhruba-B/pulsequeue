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
│   ├── shared/
│   └── redis-client/

JavaScript ONLY.
NO TypeScript.

All packages use:
"type": "module"

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
