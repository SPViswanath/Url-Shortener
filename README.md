# Shortly - Modern URL Shortener

A beautifully crafted, privacy-first URL shortener designed for professionals. Track performance, customize destinations, and manage your links in one elegant dashboard.

## Architecture Diagram

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Frontend (React + Vite hosted on Vercel)]
        UI[User Interface]
        State[State Management - Context API]
        AuthUI[Google OAuth Login]
        VercelProxy[Vercel Edge Proxy]
    end

    %% Backend Layer
    subgraph Backend [Backend (Express hosted on Render)]
        API[Express REST API]
        Auth[Auth Controller - JWT]
        URLCtrl[URL Controller]
        AnalyticsCtrl[Analytics Controller]
        Sockets[Socket.io Server]
        Redirect[302 Redirect Service]
    end

    %% Database Layer
    subgraph Database [MongoDB Atlas]
        UsersDB[(Users Collection)]
        UrlsDB[(URLs Collection)]
        ClicksDB[(Clicks Collection)]
    end

    %% Flow
    UI <--> |REST API Calls| API
    UI <--> |Real-time WebSockets| Sockets
    UI --> |Short Link Clicks| VercelProxy
    VercelProxy --> |Proxied Request| Redirect
    
    API --> Auth
    API --> URLCtrl
    API --> AnalyticsCtrl

    Auth <--> UsersDB
    URLCtrl <--> UrlsDB
    AnalyticsCtrl <--> ClicksDB
    Redirect <--> UrlsDB
    Redirect <--> ClicksDB
```

## Setup Instructions

This project is divided into two separate applications: the `client` (React frontend) and `server` (Node.js/Express backend). 

### 1. Backend Setup (`/server`)
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the provided configuration (requires `MONGO_URI`, `JWT_SECRET`, `BASE_URL`, `CLIENT_URL`, etc.)
4. Start the development server: `npm run dev``
*(The backend runs on http://localhost:5000)*

### 2. Frontend Setup (`/client`)
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file and set `VITE_API_BASE_URL=http://localhost:5000`
4. Start the Vite development server: `npm run dev`
*(The frontend runs on http://localhost:5173)*

### 3. Production Deployment
- **Backend:** Deploy the `/server` folder to a service like Render. Set the `BASE_URL` to your Vercel frontend URL so the generated links match your brand.
- **Frontend:** Deploy the `/client` folder to Vercel. Ensure `vercel.json` is present to handle React routing and Edge Proxy forwarding for the short links.

## Assumptions Made
1. **Edge Proxying:** It is assumed that the deployment platform for the frontend (Vercel) supports `vercel.json` rewrite rules to natively proxy shortlink clicks directly to the backend API without mounting a heavy React route.
2. **Authentication:** It is assumed that users will primarily log in via Google OAuth. Standard Email/Password login logic is scaffolded but relies on the UI to securely enforce HTTPS for cross-site cookies in production (`SameSite=None`).
3. **Analytics IP:** Geolocation assumes the backend is hosted on a platform that correctly populates the `x-forwarded-for` header (like Render) since the proxy sits in front of the actual Node server.
4. **Collision Resistance:** The nanoid library generates a 7-character string which is assumed to have a low enough collision rate for the scope of this hackathon. A database uniqueness check loop ensures absolute integrity.

## AI Planning Document
This application was architected by an autonomous agent using a highly structured, multi-phase execution plan:

**Phase 1: Project Foundation & Layouts**
- Scaffolded a Vite+React frontend and an Express+Mongoose backend.
- Designed a cohesive brand identity (Glassmorphism, Inter font, #e07a5f Orange primary).
- Implemented global navigation, protected routing, and context API state management.

**Phase 2: Backend Architecture & Auth**
- Designed MongoDB schemas (Users, URLs, Clicks).
- Implemented Google OAuth and JWT-based cookie authentication.
- Created robust API endpoints for CRUD operations on URLs.

**Phase 3: Core URL Management & UI**
- Developed the Dashboard UI with staggering entrance animations.
- Implemented the "Create Link" modal with real-time QR code generation.
- Built bulk-upload CSV parsing with drag-and-drop support.

**Phase 4: Real-Time Analytics (WebSockets)**
- Implemented server-side URL redirection (302) with `ua-parser-js` and `geoip-lite` for advanced click tracking.
- Wired Socket.io to push real-time click events from the redirect service directly to the active React dashboard.
- Built dynamic charts using Recharts for Geographic, Device, and Time-Series data analysis.

**Phase 5: Production & Deployment Hardening**
- Migrated the app from a monolithic structure to a robust Two-Platform architecture (Vercel + Render).
- Configured Edge Proxying (`vercel.json`) to allow branded short links.
- Sanitized environment variables and secured cross-domain cookies.

***

This project is a part of a hackathon run by https://katomaran.com
