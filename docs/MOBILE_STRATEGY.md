# PACA Mobile Strategy

This document defines the architectural approach for the PACA Mobile Application.

## 1. Technology Stack
- **Framework:** React Native (via Expo for rapid development and OTA updates).
- **Language:** TypeScript.
- **Styling:** NativeWind (Tailwind CSS for React Native).
- **State Management:** React Context & TanStack Query (for caching and synchronization).
- **Backend:** Supabase (Auth, Database, Realtime, Storage).

## 2. Core Architecture
The mobile app will act as a "Thin Client", delegating all business logic to the Supabase backend and the shared `api-client` patterns.

### A. Navigation Structure
- **Auth Stack:** Login, Register, Password Recovery.
- **Main Tab Navigator:**
    - **Home:** Personalized dashboard (Student/Teacher mode).
    - **Academy:** Course discovery and my learning.
    - **Chat:** WhatsApp-like messaging interface.
    - **Finance:** Wallet and payment history.
    - **Profile:** Account settings and role switching.

### B. Key Feature Implementations
- **Realtime Chat:** Using Supabase Realtime for instant messaging and typing indicators.
- **Virtual Classroom:** Integration of WebRTC for voice/video calls and a simplified version of the Interactive Whiteboard.
- **Push Notifications:** Integration with FCM (Firebase Cloud Messaging) via Supabase Edge Functions.
- **Offline Mode:** Local caching of course content and messages using SQLite/AsyncStorage.

## 3. Shared Logic
To avoid duplication, the following logic will be shared or mirrored:
- **Types:** All interfaces from `src/lib/types.ts` will be used.
- **API Patterns:** The `api-client` logic will be implemented in the mobile app to ensure consistent data handling.
- **Auth Flow:** Same Supabase Auth flow as the web application.

## 4. Deployment Pipeline
1. **Development:** Expo Go for rapid iteration.
2. **Testing:** TestFlight (iOS) and Google Play Console Internal Testing (Android).
3. **Production:** App Store and Google Play Store.
