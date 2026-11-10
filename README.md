# PACA

PACA — Plataforma Aberta de Conhecimento e Aprendizagem — is a modern educational platform designed to connect students, teachers, communities, and learning experiences in one environment.

## Overview

PACA brings together:

- **Learning**: courses, lessons, classroom flows, and progress tracking
- **Collaboration**: communities, messaging, and group interactions
- **Work & opportunities**: tutors, jobs, contracts, and professional matching
- **Finance**: secure payments, milestones, and payouts
- **AI**: contextual study assistance and learning support

## Core capabilities

- **Authentication & profiles** with role-based experiences for students and teachers
- **Course catalog and learning journeys**
- **Tutor and student discovery**
- **Messaging and collaboration tools**
- **Contract management and milestone flows**
- **Admin dashboard** for moderation and platform settings
- **AI-powered educational assistant**

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS 3
- **Backend**: Supabase (Auth, Database, Storage, Realtime, Edge Functions)
- **Payments**: secure milestone-based flow with provider abstraction
- **AI**: Groq and OpenAI integrations
- **TypeScript**: full application typing

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project

### Installation

```bash
cd /home/jose/PACA/PACA
npm install
cp .env.example .env
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment

Configure the required variables in `.env` for Supabase, AI, and local app settings before enabling full platform features.

## Deployment

```bash
npm run build
npm start
```

## License

MIT License - see [LICENSE](LICENSE) for details.
