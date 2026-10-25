// frontend/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Patch removeChild to tolerate DOM mutations performed by browser extensions
// (translators, ad blockers, VPN proxies) that may detach nodes React still references.
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
  if (!Object.is(child.parentNode, this)) {
    return child;
  }
  return originalRemoveChild.call(this, child) as T;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);