# Environment Variable Configuration

Movyra utilizes environment variables to securely manage API keys, project identifiers, and external service URLs across different deployment stages (Local, Staging, Production).

## Configuration Files
Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client-side JavaScript bundle.

* `.env.example`: Committed to version control. Contains keys without sensitive values.
* `.env.local`: Ignored by Git. Used for local development.
* `.env.production`: Ignored by Git. Used by CI/CD pipelines during the build process.

## Required Variables

| Variable Name | Required | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Yes | The public API key for Firebase Authentication and initialization. | `AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxx` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | The authorized domain for Firebase OAuth callbacks. | `movyra-os.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | The globally unique identifier for the Firebase project. | `movyra-os-prod` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | The Google Cloud Storage bucket URI for asset uploads. | `movyra-os-prod.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Identifier for Firebase Cloud Messaging (Push Notifications). | `102938475612` |
| `VITE_FIREBASE_APP_ID` | Yes | The specific Web App ID registered in the Firebase console. | `1:102938475612:web:abcdef123456` |
| `VITE_APP_ID` | Yes | The Movyra internal tenant identifier for Firestore path scoping. | `movyra-core` |
| `VITE_OSRM_ENDPOINT` | No | Override for enterprise self-hosted OSRM routing servers. Defaults to public API if omitted. | `https://routing.anyastro.internal` |

## Security Warning
Do not place sensitive backend secrets (e.g., Stripe Secret Keys, Firebase Admin SDK service accounts) in these `.env` files. Vite embeds these variables directly into the compiled `index-xxx.js` files, making them publicly readable by anyone inspecting the client source code.