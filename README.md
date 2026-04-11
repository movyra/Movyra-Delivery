# Movyra by Bongo
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.8.0-FFCA28.svg)

Movyra is an enterprise-grade, real-time logistics and delivery platform engineered by Bongo, an initiative of AnyAstro Techno Pvt Ltd. Designed for high-frequency dispatch, route optimization, and real-time telemetry tracking, Movyra provides a seamless Progressive Web App (PWA) experience for both end-users and fleet drivers.

## Core Architecture and Features
Movyra is built on a modern, decoupled architecture ensuring high availability, offline resilience, and strict data security.

* **Real-Time Telemetry Engine:** Utilizes Leaflet and MapLibre for hardware-accelerated map rendering, coupled with Firebase Firestore real-time listeners for sub-second driver location updates.
* **Smart Routing and Distance Matrix:** Integrated with OpenStreetMap (Nominatim) for free, rate-limit-resistant geocoding, and OSRM (Open Source Routing Machine) for dynamic route calculation, distance variance detection, and ETA prediction.
* **Enterprise Security and Authentication:** Secure login via Firebase Authentication with role-based access control (RBAC). Firestore security rules strictly enforce user-scoped data access paths to prevent lateral data breaches.
* **Offline-First Progressive Web App (PWA):** Aggressive caching strategies using Vite PWA ensure sub-3G network resilience. Core UI shells and map layers are cached locally for instant loads.
* **Multi-Stop Logistics and Optimization:** Complex routing algorithms supporting up to 5 distinct drop-off points per dispatch, complete with dynamic route swapping and strict coordinate deduplication.

## Quick Start Guide
To set up the Movyra environment on your local machine for development and testing:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AnyAstro-Techno/movyra-os.git](https://github.com/AnyAstro-Techno/movyra-os.git)
    cd movyra-os
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and configure your Firebase credentials. Reference `DEPLOYMENT.md` for specific variable requirements.
4.  **Start the development server:**
    ```bash
    npm run dev
    ```

## Contributing
We welcome contributions from the developer community. Please review `CONTRIBUTING.md` and our `CODE_OF_CONDUCT.md` prior to submitting a pull request to ensure alignment with our engineering standards.