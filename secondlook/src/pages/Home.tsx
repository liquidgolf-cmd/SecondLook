import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import NoraAvatar from '../components/Nora/NoraAvatar'

type AuthView = 'landing' | 'signin' | 'signup'

export default function Home() {
  const navigate = useNavigate()
  const [view, setView] = useState<AuthView>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (type: 'signin' | 'signup') => {
    setError('')
    setLoading(true)
    try {
      if (type === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
        navigate('/onboarding')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        navigate('/check')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      // Clean up Firebase error messages for user display
      if (message.includes('email-already-in-use')) {
        setError('An account with this email already exists.')
      } else if (message.includes('wrong-password') || message.includes('invalid-credential')) {
        setError('Incorrect email or password.')
      } else if (message.includes('weak-password')) {
        setError('Password should be at least 6 characters.')
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address.')
      } else if (message.includes('user-not-found')) {
        setError('No account found with this email.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9F6F1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      {view === 'landing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', maxWidth: '480px' }}
        >
          <NoraAvatar size="lg" />
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              color: '#1C2B4A',
              margin: '24px 0 8px',
              lineHeight: 1.2,
            }}
          >
            SecondLook
          </h1>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '1.125rem',
              color: '#4A5568',
              margin: '0 0 40px',
            }}
          >
            Double-check because it matters.
          </p>
          <p style={{ color: '#4A5568', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px' }}>
            Nora is a calm digital safety companion who helps you spot unusual patterns in messages, texts, and emails — before you act.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setView('signup')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#1C2B4A',
                color: 'white',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1.0625rem',
                fontWeight: 500,
                cursor: 'pointer',
                minHeight: '56px',
              }}
            >
              Get started — it's free
            </button>
            <button
              onClick={() => setView('signin')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '999px',
                border: '1.5px solid #EDE8DF',
                backgroundColor: 'transparent',
                color: '#1C2B4A',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1.0625rem',
                cursor: 'pointer',
                minHeight: '56px',
              }}
            >
              Sign in
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#7A8BA0', marginTop: '24px' }}>
            5 free message checks. No credit card required.
          </p>
        </motion.div>
      )}

      {(view === 'signin' || view === 'signup') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <NoraAvatar size="md" />
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.75rem',
              color: '#1C2B4A',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            {view === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(200, 90, 90, 0.1)', marginBottom: '16px' }}>
              <p style={{ margin: 0, color: '#C85A5A', fontSize: '0.9rem' }}>{error}</p>
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1.5px solid #EDE8DF',
              backgroundColor: 'white',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '1rem',
              color: '#1C2B4A',
              outline: 'none',
              marginBottom: '12px',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth(view)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1.5px solid #EDE8DF',
              backgroundColor: 'white',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '1rem',
              color: '#1C2B4A',
              outline: 'none',
              marginBottom: '20px',
            }}
          />

          <button
            onClick={() => handleAuth(view)}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#1C2B4A',
              color: 'white',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !email || !password ? 0.5 : 1,
              minHeight: '56px',
              marginBottom: '16px',
            }}
          >
            {loading ? (view === 'signup' ? 'Creating account…' : 'Signing in…') : (view === 'signup' ? 'Create account' : 'Sign in')}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#7A8BA0' }}>
            {view === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setView(view === 'signup' ? 'signin' : 'signup')}
              style={{ background: 'none', border: 'none', color: '#4A8FA8', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              {view === 'signup' ? 'Sign in' : 'Get started'}
            </button>
          </p>

          <button
            onClick={() => setView('landing')}
            style={{
              display: 'block',
              margin: '16px auto 0',
              background: 'none',
              border: 'none',
              color: '#7A8BA0',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </motion.div>
      )}
    </div>
  )
}
