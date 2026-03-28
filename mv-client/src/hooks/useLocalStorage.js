import { useState } from 'react';
export default function useLocalStorage(key, initialValue) {
  const [val, setVal] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const setValue = (v) => { setVal(v); window.localStorage.setItem(key, JSON.stringify(v)); };
  return [val, setValue];
}
