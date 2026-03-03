import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseConfigured } from './lib/firebase'
import { useFamily } from './hooks/useFamily'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Check from './pages/Check'
import Dashboard from './pages/Dashboard'
import Family from './pages/Family'
import Settings from './pages/Settings'
import BottomNav from './components/ui/BottomNav'
import './index.css'

function SetupScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4A8FA8 0%, #1C2B4A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 24, color: 'white', fontWeight: 600 }}>N</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C2B4A', fontSize: '1.75rem', marginBottom: 8 }}>Setup required</h1>
        <p style={{ color: '#4A5568', lineHeight: 1.6, marginBottom: 24 }}>
          Add your Firebase credentials to <code style={{ fontFamily: "'DM Mono', monospace", backgroundColor: '#EDE8DF', padding: '2px 6px', borderRadius: 4, fontSize: '0.9rem' }}>.env.local</code> to run SecondLook locally.
        </p>
        <div style={{ padding: '20px', borderRadius: 16, backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)', textAlign: 'left', fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', color: '#1C2B4A', lineHeight: 1.8 }}>
          <div style={{ color: '#7A8BA0' }}># secondlook/.env.local</div>
          <div>VITE_FIREBASE_API_KEY=<span style={{ color: '#4A8FA8' }}>your_api_key</span></div>
          <div>VITE_FIREBASE_AUTH_DOMAIN=<span style={{ color: '#4A8FA8' }}>your_project.firebaseapp.com</span></div>
          <div>VITE_FIREBASE_PROJECT_ID=<span style={{ color: '#4A8FA8' }}>your_project_id</span></div>
          <div>VITE_FIREBASE_STORAGE_BUCKET=<span style={{ color: '#4A8FA8' }}>your_project.appspot.com</span></div>
          <div>VITE_FIREBASE_MESSAGING_SENDER_ID=<span style={{ color: '#4A8FA8' }}>your_sender_id</span></div>
          <div>VITE_FIREBASE_APP_ID=<span style={{ color: '#4A8FA8' }}>your_app_id</span></div>
        </div>
        <p style={{ color: '#7A8BA0', fontSize: '0.875rem', marginTop: 16 }}>
          Find these in Firebase console → Project settings → Your apps
        </p>
      </div>
    </div>
  )
}

// Pages that show the bottom nav
const NAV_PATHS = ['/check', '/dashboard', '/family', '/settings']

function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const showNav = NAV_PATHS.includes(location.pathname)
  return (
    <>
      <div style={{ paddingBottom: showNav ? '72px' : 0 }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  if (user === undefined) {
    // Still loading
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7A8BA0', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  if (!firebaseConfigured) {
    return <SetupScreen />
  }

  return (
    <BrowserRouter>
      <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />
        <Route
          path="/check"
          element={
            <RequireAuth>
              <Check />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/family"
          element={
            <RequireAuth>
              <Family />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        {/* Family invite acceptance */}
        <Route
          path="/family/accept"
          element={
            <RequireAuth>
              <FamilyAccept />
            </RequireAuth>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

// Inline family invite acceptance component
function FamilyAccept() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const { acceptInvite } = useFamily()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      return
    }

    acceptInvite(token).then(success => {
      setStatus(success ? 'success' : 'error')
    })
  }, [acceptInvite])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        {status === 'loading' && <p style={{ color: '#7A8BA0', fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif" }}>Connecting…</p>}
        {status === 'success' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C2B4A' }}>You're connected.</h2>
            <p style={{ color: '#4A5568' }}>You'll now receive safety summaries. Your family member is always in control of what you see.</p>
            <a href="/dashboard" style={{ display: 'inline-block', marginTop: '20px', padding: '14px 32px', borderRadius: '999px', backgroundColor: '#1C2B4A', color: 'white', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Go to dashboard
            </a>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C2B4A' }}>This invite has expired or is not valid.</h2>
            <p style={{ color: '#4A5568' }}>Please ask your family member to send a new invite.</p>
          </>
        )}
      </div>
    </div>
  )
}
