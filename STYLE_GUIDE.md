# Movyra Coding Style and Conventions

To ensure a highly maintainable and readable codebase across the engineering team at AnyAstro Techno Solutions, all contributions to Movyra must adhere to the following strict stylistic conventions.

## 1. React Component Architecture
* **Functional Components:** Only use functional components with React Hooks. Class components are strictly prohibited unless implementing an Error Boundary.
* **Export Definitions:** Export components as default at the declaration site.
  ```javascript
  export default function SystemCard({ children }) { ... }
Prop Types/Destructuring: Destructure props immediately in the function signature. Do not use props.children. Provide default fallback values for optional props.

## 2. Tailwind CSS Conventions
Class Ordering: To maintain readability, order Tailwind classes conceptually: Layout -> Positioning -> Dimensions -> Typography -> Backgrounds -> Borders -> Effects/Transitions.

Bad: className="text-white p-4 bg-black absolute w-full flex top-0"

Good: className="absolute top-0 flex w-full p-4 bg-black text-white"

Dynamic Classes: Use template literals for dynamic class injection. Avoid installing heavy libraries like classnames unless absolutely necessary for deeply nested conditionals.

```JavaScript
className={`transition-all ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
Arbitrary Values: Minimize the use of arbitrary values (e.g., w-[300px]). Rely on the Tailwind spacing scale (w-64, w-72) unless a precise pixel measurement is required for map overlays or hardware integration.
```

## 3. State Management (Zustand)
Atomic Subscriptions: Components must subscribe only to the exact state variables they require. Do not destructure the entire store.

```JavaScript
// Bad (Causes re-renders on ANY store change)
const { pickup, setPickup } = useBookingStore();

// Good (Optimized for performance)
const pickup = useBookingStore(state => state.pickup);
const setPickup = useBookingStore(state => state.setPickup);
Immutability: Always treat state as immutable within Zustand setter functions. Do not use array push() or object mutation; use the spread operator.
```

## 4. File Naming Conventions
Components: PascalCase (e.g., LiveTracking.jsx, SystemButton.jsx).

Utilities/Hooks: camelCase (e.g., useBookingStore.js, routing.js).

Directories: PascalCase for UI groupings (e.g., components/OrderDetails/), lowercase for systemic directories (e.g., store/, utils/).