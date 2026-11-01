# Technical Audit Report - TutorHub to PACA

This document contains the detailed technical analysis of the current system to guide the transformation into the PACA platform.

## 1. Current Stack Analysis
- **Frontend:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management:** React Context / Hooks
- **Internationalization:** Custom i18n provider

## 2. Business Flow Mapping
- **Authentication:** Handled via Supabase Auth. Roles defined as STUDENT, PARENT, TUTOR, AGENCY, ADMIN.
- **User Profiles:** Specialized `TutorProfile` with subjects, hourly rates, and languages.
- **Tutor Discovery:** Search system based on `SearchTutorDocument` and `TutorSearchResult`.
- **Booking/Contracting:** 
    - Flow: JobPost $\rightarrow$ Proposal $\rightarrow$ Interview $\rightarrow$ Contract.
    - Support for different pay types (Hourly, Monthly, Fixed).
- **Payment Flow:** Milestone-based payments (`ContractMilestone`) linked to a `Payment` entity with provider references.
- **Communication:** Full conversation system with participants, read receipts, and file attachments.
- **Scheduling:** Availability management (`TutorAvailability`) and session scheduling (`ScheduledSession`).
- **Feedback:** Multi-dimensional rating system (Professionalism, Communication, Punctuality, Expertise).

## 3. Database Schema Audit (Inferred from Types)
- **Core Tables:** `profiles`, `tutor_profiles`, `job_posts`, `proposals`, `contracts`, `contract_milestones`, `payments`.
- **Communication Tables:** `conversations`, `messages`, `conversation_participants`.
- **Scheduling Tables:** `interviews`, `tutor_availability`, `scheduled_sessions`.
- **Feedback Tables:** `reviews`, `review_votes`, `tutor_review_stats`.
- **Notification Tables:** `email_notifications`, `notification_preferences`.
- **Relations:** Strong relational links between JobPosts $\rightarrow$ Proposals $\rightarrow$ Contracts.

## 4. Gap Analysis (TutorHub $\rightarrow$ PACA)
- **Current:** A high-quality marketplace for matching tutors with students/parents.
- **Target:** A complete educational ecosystem.
- **Missing Components:**
    - [ ] **LMS (Learning Management System):** No structure for courses, modules, or lessons.
    - [ ] **Academic Tracking:** No way to track student progress over time (only session-based).
    - [ ] **Curriculum Management:** No standardized academic paths.
    - [ ] **AI Integration:** No AI-driven tutoring or content generation.
    - [ ] **Institutional Tools:** No tools for managing "Academies" as entities beyond a simple "Agency" role.

## 5. Technical Debt & Bottlenecks
- [ ] **Type Redundancy:** Some types are duplicated between `shared` and `lib/types.ts`.
- [ ] **Scalability:** The current contract-based flow is linear; an ecosystem needs a more flexible "Learning Path" approach.
