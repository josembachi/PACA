# PACA System Architecture

This document defines the architectural blueprint for the PACA platform, evolving from the TutorHub marketplace.

## 1. Core Philosophy
PACA is an **Open Knowledge and Learning Platform**. The architecture must support the duality of the user: every user is potentially both a learner and a teacher.

## 2. User Model Evolution
### Current (TutorHub)
- Fixed roles: `STUDENT`, `TUTOR`, `PARENT`, etc.
- Separate profiles for tutors.

### Target (PACA)
- **Unified Account:** One `auth.users` entry.
- **Role-Based Capabilities:** Instead of a single role, users have "Capabilities" or "Profiles".
- **Dual Profile:** 
    - `StudentProfile`: Learning history, enrolled courses, preferences.
    - `TeacherProfile`: Qualifications, courses offered, availability, ratings.

## 3. Modular Domain Design
The system is divided into independent but interoperable modules:

### A. Identity & Access (IAM)
- Unified Auth via Supabase.
- Permission-based access control (RBAC) validated on the server.

### B. Marketplace & Discovery
- Search engine for teachers, courses, and subjects.
- Filtering by location, price, and rating.

### C. Communication Layer (The "WhatsApp" Module)
- **Real-time Engine:** Supabase Realtime / WebRTC.
- **Entities:**
    - `Conversations`: Private or Group.
    - `Messages`: Text, Voice Notes, Files, Video.
    - `Participants`: User link to conversation with read receipts and mute status.
    - `Communities`: High-level groupings of conversations/interests.
    - `Calls`: Session-based voice/video calls (WebRTC).
- **Features:** Voice notes, file sharing, group chats, communities.

### D. Academy (LMS)
- **Hierarchy:** `Course` $\rightarrow$ `Module` $\rightarrow$ `Lesson`.
- **Virtual Classroom:** Integrated WebRTC video/audio + Interactive Whiteboard.
- **Progress Tracking:** 
    - `Enrollments`: Link between Student and Course.
    - `LessonProgress`: Tracking completion of individual lessons.
    - `Certifications`: Issued upon course completion.
- **Materials:** Document sharing and exercise management.

### E. Financial Ecosystem
- **Abstraction Layer:** A `PaymentGateway` interface to decouple the platform from specific banks.
- **Escrow Logic:** Implementation of the "Deposit Guarantee" flow for the BAI integration.

## 4. Multiplatform Strategy
- **API First:** All business logic resides in the backend (Supabase Edge Functions / API Routes).
- **Frontend:** Next.js (Web) $\rightarrow$ Electron (Desktop) $\rightarrow$ React Native (Mobile).

## 5. Technical Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Real-time:** WebRTC (Calls), Supabase Realtime (Chat).
- **AI:** Modular integration via AI SDK (OpenAI, Groq).
