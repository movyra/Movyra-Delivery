# Contributing to Movyra

First and foremost, thank you for considering contributing to Movyra, an enterprise logistics operating system developed by Bongo, an initiative of AnyAstro Techno Pvt Ltd. We value the time and effort of our developer community. To ensure a highly efficient, secure, and structured integration process, please strictly adhere to the guidelines documented below.

## 1. Development Prerequisites
Before you begin, ensure your local development environment meets the strict baseline requirements for the Movyra tech stack:
* **Node.js:** Version 18.17.0 or strictly higher (LTS recommended).
* **Package Manager:** NPM version 9.0.0 or higher.
* **Git:** Version 2.30.0 or higher.
* **Firebase CLI:** Installed globally (`npm install -g firebase-tools`) for deploying rules and testing localized functions.

## 2. Local Environment Setup
To isolate development environments and prevent production data corruption, you must set up a local instance.
1. Fork the repository to your personal GitHub account.
2. Clone your fork locally: `git clone https://github.com/movyra/Movyra-Delivery.git`
3. Navigate into the directory: `cd Movyra-Delivery`
4. Install all dependencies strictly utilizing the lockfile: `npm ci`
5. Duplicate the environment template: `cp .env.example .env.local`
6. Populate `.env.local` with your designated staging Firebase credentials. Never commit this file.
7. Start the Vite development server: `npm run dev`

## 3. Branching Strategy
We enforce a rigid Git Flow branching model to maintain repository stability.
* **main:** The immutable production branch. Direct commits are structurally blocked.
* **develop:** The primary integration branch for the next release cycle.
* **Feature Branches:** Must branch from `develop`. Naming convention: `feat/issue-ID-brief-description` (e.g., `feat/402-osrm-multipoint`).
* **Bugfix Branches:** Must branch from `develop` (or `main` for critical hotfixes). Naming convention: `fix/issue-ID-brief-description` (e.g., `fix/405-leaflet-memory-leak`).

## 4. Commit Message Conventions
Movyra enforces the Conventional Commits specification. This allows our CI/CD pipelines to automatically generate semantic versioning and changelogs.
Format: `<type>(<scope>): <subject>`
* **feat:** Introduces a new feature to the codebase.
* **fix:** Patches a bug in the codebase.
* **docs:** Modifies documentation (README, markdown files).
* **style:** Adjusts formatting, missing semi-colons, etc. No logic change.
* **refactor:** Rewrites code without changing its external behavior.
* **perf:** Improves execution time or memory utilization.
* **test:** Adds missing tests or corrects existing ones.
* **chore:** Updates build tasks, package manager configs, etc.
Example: `perf(map): implement debounce on OSRM route fetch to prevent rate limiting`

## 5. Pull Request Lifecycle
1. Ensure your local branch is rebased against the latest upstream `develop` branch to resolve conflicts locally.
2. Run the local test suite: `npm run test:unit` and ensure 100% pass rate.
3. Run the linter: `npm run lint`. Do not bypass linting rules without explicit inline justification.
4. Push your branch and open a Pull Request against `AnyAstro-Techno/movyra-os:develop`.
5. Completely fill out the provided Pull Request template.
6. Await automated CI checks (GitHub Actions). If any check fails, the PR will not be reviewed.
7. Address reviewer feedback promptly. Code will only be merged after receiving at least one approval from a core maintainer.