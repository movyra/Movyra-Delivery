# Bug Report

![Bug](https://img.shields.io/badge/Type-Bug-red.svg)

## System Environment
* **OS:** (e.g., macOS 14.1, Windows 11, Android 14)
* **Browser:** (e.g., Chrome 122, Safari 17, PWA Standalone Mode)
* **Movyra Version/Commit:** (e.g., v1.0.0 or Git Hash `a1b2c3d`)
* **Node Version:** (e.g., v18.17.0)

## Expected Behavior
## Actual Behavior
## Steps to Reproduce
1. Log in to the application.
2. Navigate to the Booking module.
3. Enter coordinates 'X' for pickup.
4. Rapidly click the 'Back' button before the OSRM route resolves.
5. Observe the crash.

## Console Logs / Stack Trace
```text
TypeError: Cannot read properties of null (reading 'getSource')
    at drawRouteLine (SetLocation.jsx:190:29)