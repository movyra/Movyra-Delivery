<!-- ===================== LOGO ===================== -->
<p align="center">
  <img src="https://movyra-customer-prod.web.app/logo.png" alt="Movyra Logo" width="160" height="160" />
</p>

<h1 align="center">Movyra</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" />
  <img src="https://img.shields.io/badge/platform-PWA-lightgrey.svg" />
  <img src="https://img.shields.io/badge/React-18.3.1-61dafb.svg" />
  <img src="https://img.shields.io/badge/Firebase-12.13.0-FFCA28.svg" />
  <img src="https://img.shields.io/badge/region-India-orange.svg" />
</p>

## Overview

Movyra is a connected ecosystem offering delivery, smart city management, and humanitarian rescue solutions. It is designed to solve operational challenges with real-time coordination, reliability, and scalable system design.

Movyra operates as a Progressive Web App (PWA), ensuring seamless performance across devices. It is built to support customers, partners, and vendors within a unified system.

## Our Solutions

<div>
  <img src="https://movyra.web.app/logo-3.png" alt="Movyra" height="28" style="vertical-align: middle;" />
  <span style="font-size: 1.5rem; font-weight: bold; letter-spacing: -1px; margin-left: -5px; color: #ffffff;">ovyra <span style="color: #888888; font-size: 1.2rem;">Civic</span></span>
</div>
<p>Smart city management. Report infrastructure issues easily.</p>

<br/>

<div>
  <img src="https://movyra.web.app/logo-4.png" alt="Movyra" height="28" style="vertical-align: middle;" />
  <span style="font-size: 1.5rem; font-weight: bold; letter-spacing: -1px; margin-left: -5px; color: #ffffff;">ovyra <span style="color: #888888; font-size: 1.2rem;">Sahay</span></span>
</div>
<p>Humanitarian rescue operations. Connect and report live cases.</p>

<br/>

<div>
  <img src="https://movyra.web.app/logo.png" alt="Movyra" height="28" style="vertical-align: middle;" />
  <span style="font-size: 1.5rem; font-weight: bold; letter-spacing: -1px; margin-left: -5px; color: #ffffff;">ovyra <span style="color: #888888; font-size: 1.2rem;">Delivery</span></span>
</div>
<p>Next-generation urban logistics and enterprise fleet management.</p>

## Core Architecture and Features

Movyra is built on a modern, decoupled architecture ensuring high availability, offline resilience, and strict data security.

### Real-Time Telemetry Engine
Utilizes Leaflet and MapLibre for hardware-accelerated map rendering, combined with Firebase Firestore real-time listeners to enable sub-second driver location updates and live tracking capabilities.

### Smart Routing and Distance Matrix
Integrated with OpenStreetMap (Nominatim) for geocoding and OSRM (Open Source Routing Machine) for route calculation, ETA prediction, and distance optimization. The system handles dynamic route changes and ensures efficient navigation.

### Enterprise Security and Authentication
Implements Firebase Authentication with role-based access control (RBAC). Firestore security rules enforce strict access boundaries, ensuring that user data remains isolated and protected against unauthorized access.

### Offline-First Progressive Web App (PWA)
Built using Vite PWA with aggressive caching strategies. Core interface elements and map layers are cached locally, enabling fast loading and usability even in poor network conditions.

### Multi-Stop Logistics and Optimization
Supports multiple drop-off points within a single request. Includes dynamic route adjustments, optimized sequencing, and strict coordinate validation for accurate delivery execution.

## Technology Stack

- Frontend: React, Vite, Tailwind CSS  
- Backend: Firebase (Firestore, Authentication, Functions)  
- Maps: Leaflet, MapLibre, OpenStreetMap  
- Routing: OSRM  
- Realtime: Firestore listeners  
- Hosting: Vercel or Firebase Hosting  

## Quick Start Guide

### 1. Clone the Repository
```bash
git clone [https://github.com/movyra/movyra.git](https://github.com/movyra/movyra.git)
cd movyra

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory and configure your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

```

Refer to `DEPLOYMENT.md` for full configuration details.

### 4. Start Development Server

```bash
npm run dev

```

## Security Notice

This repository is publicly accessible for transparency and collaboration. Core business logic, pricing systems, and critical security mechanisms are not included in this codebase and are handled through secure backend systems.

Any attempt to misuse, replicate, or exploit this system is strictly monitored.

## Usage Restrictions

This repository is intended for viewing, learning, and contribution purposes only.

The following actions are not permitted:

* Commercial use of this code
* Reproduction of the platform
* Creation of competing systems using this codebase

## License

```text
Copyright (c) Movyra

All Rights Reserved.

This codebase is proprietary and confidential.
Unauthorized copying, modification, distribution, or commercial usage is strictly prohibited without explicit permission.

```

## Contributing

We welcome contributions from developers who aim to build scalable, real-world systems.

Before submitting a pull request:

* Review `CONTRIBUTING.md`
* Follow `CODE_OF_CONDUCT.md`
* Ensure submissions are practical and aligned with system goals

## Vision

Movyra is focused on building a reliable, scalable, and safety-driven logistics and other great network designed for real-world conditions in India. The system aims to create a balanced ecosystem for customers, partners, and vendors while maintaining operational efficiency and trust.