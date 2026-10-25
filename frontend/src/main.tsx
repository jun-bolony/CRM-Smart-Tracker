import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle Vite dynamic chunk preload errors (stale chunks after a new deploy).
// Guard against infinite reload loops by debouncing reloads within a 10 second window.
window.addEventListener('vite:preloadError', () => {
  const lastReload = Number(sessionStorage.getItem('vite:last-reload') || 0)
  if (Date.now() - lastReload < 10_000) {
    return
  }
  sessionStorage.setItem('vite:last-reload', String(Date.now()))
  window.location.reload()
})

// Patch removeChild to tolerate DOM mutations performed by browser extensions
// (translators, ad blockers, VPN proxies) that may detach nodes React still references.
const originalRemoveChild = Node.prototype.removeChild
Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
  if (!Object.is(child.parentNode, this)) {
    return child
  }
  return originalRemoveChild.call(this, child) as T
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)