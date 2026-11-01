# PACA Transformation Roadmap

This document tracks the evolution of TutorHub into the PACA platform.

## 🎯 Vision
Transform a tutor marketplace into a complete educational ecosystem (PACA) - Plataforma Aberta de Conhecimento e Aprendizagem.

## 🛠 Development Sequence
1. [x] **Auditoria** (Technical Audit) - *Completed*
2. [x] **Arquitectura** (System Architecture) - *Completed*
3. [x] **Base de dados** (Database Evolution) - *Completed*
4. [ ] **Backend** (Business Logic & API) - *In Progress*
5. [ ] **Interface** (UI/UX Redesign)
6. [ ] **Comunicação** (Messaging & Collaboration)
7. [ ] **Academia** (Learning Management & Courses)
8. [ ] **Pagamentos** (Financial Ecosystem)
9. [ ] **Inteligência Artificial** (AI Integration)
10. [ ] **Aplicações Multiplataforma** (Mobile/Desktop)

## 📈 Current Progress

### Phase 1: Auditoria
- [x] Initial codebase analysis.
- [x] Identification of core dependencies and architectural bottlenecks.
- [x] Mapping of all existing business flows (Auth, Booking, Payments, Profiles).
- [x] Database Schema Audit (Inferred from Types).
- [x] Gap analysis: TutorHub vs. PACA requirements (Full Specification received).
- [x] Technical Debt Identification.
- [x] Final Audit Report delivery.

### Phase 2: Arquitectura
- [x] Define Unified User Model (Student/Teacher duality).
- [x] Design Modular Communication Layer (WhatsApp-like).
- [x] Design LMS Structure (Courses, Modules, Lessons).
- [x] Design Financial Integration Layer (BAI/Escrow).
- [x] Define Multiplatform API Strategy.

### Phase 3: Base de dados
- [x] Migrate `profiles` to support dual roles (Migration 001).
- [x] Implement LMS tables (`courses`, `modules`, `lessons`, `enrollments`) (Migration 002).
- [x] Implement Advanced Communication tables (`communities`, `calls`) (Migration 003).
- [x] Implement Financial Ledger and Escrow tables (Migration 004).
- [x] Update RLS Policies for the new architecture (Migration 005).

### Phase 4: Backend
- [x] Implement Unified Profile Service (Student/Teacher duality).
- [x] Implement LMS Business Logic (Course creation, Enrollment).
- [x] Implement Advanced Messaging API (Groups, Communities).
- [x] Implement Financial Ledger & Escrow Logic.
- [ ] Implement AI Integration Layer.

## 📝 Notes
- Maintain all useful existing features.
- No mass-file modifications; follow the sequence.
- Test every feature before marking as complete.
