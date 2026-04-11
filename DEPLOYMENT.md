# Deployment Guide for Movyra

This guide outlines the strict procedures required to deploy the Movyra client application to a production environment using Firebase Hosting.

## Prerequisites
Ensure the following tools are installed and configured on your CI/CD runner or local deployment machine:
* Node.js (v18 or higher)
* NPM (v9 or higher)
* Firebase CLI (`npm install -g firebase-tools`)

## Environment Configuration
Movyra requires specific environment variables to interact with backend services. Create a `.env.production` file in the root of the project. **Never commit this file to version control.**

```env
# .env.production
VITE_FIREBASE_API_KEY="AIzaSyYourProductionKeyHere..."
VITE_FIREBASE_AUTH_DOMAIN="movyra-production.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="movyra-production"
VITE_FIREBASE_STORAGE_BUCKET="movyra-production.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"

# Optional: Dedicated OSRM Server for production scale
VITE_OSRM_ROUTING_URL="[https://routing.anyastro.internal](https://routing.anyastro.internal)"