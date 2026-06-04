# Shortly
**Shorten URLs. Broaden your reach.**

A beautifully crafted, privacy-first URL shortener designed for professionals. Shortly provides enterprise-grade link management with real-time analytics, bulk operations, and a premium user experience built with a full-stack JavaScript architecture.

---

## 1. Planning the app
The ideation of **Shortly** began with a simple problem: modern marketers and businesses need to share links, but long URLs are ugly, untrackable, and unprofessional. The goal was to build a platform that not only shortens links but provides deep, actionable insights into *who* is clicking them and *from where*. 

**Target Audience:** Digital marketers, content creators, and enterprise teams.

**Core Objectives:**
- Create a frictionless User Interface (UI) focused on speed and aesthetics.
- Build a robust, non-blocking backend capable of handling high-volume redirects.
- Implement real-time data visualization for immediate feedback on campaigns.
- Bridge offline/online marketing with automated QR code generation.

---

## 2. Listing and Documenting Features
Shortly is packed with enterprise-grade features designed to maximize link utility:

### Authentication & Security
- **Secure Login:** JWT token-based authentication with bcrypt password hashing.
- **Google OAuth:** 1-click seamless login integration.
- **Protected Routes:** Dashboard and analytics are strictly guarded.

### URL Management
- **Smart Shortening:** Auto-generated 7-character short codes (using collision-resistant nanoid).
- **Custom Aliases:** Users can define branded, human-readable links (e.g., `shortly/my-brand`).
- **Expiry Dates:** Automatically deactivate time-limited marketing campaigns.
- **Bulk Upload:** Drag-and-drop CSV parser to instantly create hundreds of links at once.
- **QR Code Generation:** Every link automatically receives a high-quality, downloadable QR code.

### Advanced Analytics
- **Real-time Click Tracking:** Captures rich visit details the millisecond a link is clicked.
- **Device Analytics:** Classifies incoming traffic by Browser, Device Type (Mobile/Desktop), and Operating System.
- **Geolocation Tracking:** Maps clicks to their origin Country and City via IP resolution.
- **Interactive Visualization:** Dynamic pie charts, line graphs, and world maps built with Recharts.

---

## 3. Setup Instructions

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (or local MongoDB instance)

### Local Development Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/SPViswanath/Url-Shortener.git
   cd Url-Shortener
   ```

2. **Backend Setup (`/server`):**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` folder:*
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shortly
   JWT_SECRET=your_super_secret_jwt_key
   BASE_URL=http://localhost:5173
   CLIENT_URL=http://localhost:5173
   ```
   *Start the backend:* `npm run dev`

3. **Frontend Setup (`/client`):**
   ```bash
   cd ../client
   npm install
   ```
   *Create a `.env` file in the `client` folder:*
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   *Start the frontend:* `npm run dev`

---

## 4. Assumptions Made
During development and architecture design, the following assumptions were made:
1. **Edge Proxying (Vercel):** Assumed that the frontend deployment platform (Vercel) supports `vercel.json` network-level rewrites to proxy shortlink clicks directly to the backend without loading the React app, ensuring maximum redirect speed.
2. **Stateless Authentication:** Assumed users will access the platform from multiple devices, making HTTP-only JWT cookies (`SameSite=None` in production) the most secure stateless auth method.
3. **Analytics IP Resolution:** Geolocation assumes the backend is hosted on a platform (like Render) that correctly populates the `x-forwarded-for` header, bypassing the Vercel proxy to get the true user IP.
4. **Collision Resistance:** Assumed that a 7-character nanoid generation is sufficiently collision-resistant for the scope of the app, backed by a database unique-index fallback.

---

## 5. AI Planning Document and Architecture Diagram

### AI Planning Document
This application was architected by an autonomous AI agent using a highly structured, 5-phase execution plan:

- **Phase 1: Foundation & Layouts:** Scaffolded Vite+React (Frontend) and Express+Mongoose (Backend). Established a Glassmorphism design system using Tailwind CSS.
- **Phase 2: Backend Architecture:** Designed MongoDB schemas (Users, URLs, Clicks) and implemented stateless JWT cookie authentication.
- **Phase 3: Core URL Management:** Built the Dashboard UI, real-time QR code generation, and the asynchronous CSV Bulk Upload engine.
- **Phase 4: Real-Time Analytics:** Implemented the 302 Redirect Service with `ua-parser-js` and `geoip-lite`. Wired Socket.io to push real-time click events to the React dashboard.
- **Phase 5: Production Hardening:** Migrated to a Two-Platform architecture (Vercel + Render) and configured Edge Proxying (`vercel.json`) to allow branded short links while maintaining backend analytics.

### Architecture Diagram
```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Frontend (React + Vite hosted on Vercel)]
        UI[User Interface]
        State[Context API]
        VercelProxy[Vercel Edge Proxy]
    end

    %% Backend Layer
    subgraph Backend [Backend (Express hosted on Render)]
        API[Express REST API]
        Auth[Auth & OAuth Controller]
        URLCtrl[URL Management]
        AnalyticsCtrl[Analytics Processing]
        Redirect[302 Redirect Service]
    end

    %% Database Layer
    subgraph Database [MongoDB Atlas]
        UsersDB[(Users)]
        UrlsDB[(URLs)]
        ClicksDB[(Clicks)]
    end

    %% Flow
    UI <--> |REST API Calls| API
    UI --> |Short Link Clicks| VercelProxy
    VercelProxy --> |Proxied Request + Headers| Redirect
    
    API --> Auth
    API --> URLCtrl
    API --> AnalyticsCtrl

    Auth <--> UsersDB
    URLCtrl <--> UrlsDB
    AnalyticsCtrl <--> ClicksDB
    Redirect <--> UrlsDB
    Redirect <--> ClicksDB
```

---

*This project is a part of a hackathon run by https://katomaran.com*
