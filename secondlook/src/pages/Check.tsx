import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NoraAvatar from '../components/Nora/NoraAvatar'
import RiskCard from '../components/Check/RiskCard'
import { useNora } from '../hooks/useNora'
import { useUser } from '../hooks/useUser'

export default function Check() {
  const [message, setMessage] = useState('')
  const { analysis, state, analyze, reset, logUserAction } = useNora()
  const { profile } = useUser()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mode = profile?.mode ?? 'standard'
  const userName = profile?.first_name ?? 'there'

  const handleSubmit = async () => {
    if (!message.trim()) return
    await analyze(message.trim(), mode, userName)
  }

  const handleContinue = async () => {
    await logUserAction('continued')
    reset()
    setMessage('')
    textareaRef.current?.focus()
  }

  const handleAskForHelp = async () => {
    await logUserAction('contacted_family')
    // TODO: trigger family notification UI
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
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
        padding: '40px 20px',
      }}
    >
      {/* Nora header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <NoraAvatar
          size="md"
          isActive={state === 'analyzing'}
          showRing={state === 'analyzing'}
        />
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '1.125rem',
            color: '#1C2B4A',
            margin: 0,
            opacity: state === 'result' ? 0 : 1,
            transition: 'opacity 0.3s',
          }}
        >
          {state === 'analyzing'
            ? 'Nora is looking…'
            : "Let's take a second look."}
        </p>
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {(state === 'idle' || state === 'analyzing') && (
          <motion.div
            key="input"
            style={{ width: '100%', maxWidth: '560px' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a message, text, or email here…"
              disabled={state === 'analyzing'}
              aria-label="Message to analyze"
              style={{
                width: '100%',
                minHeight: '180px',
                padding: '20px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(28, 43, 74, 0.08)',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1.125rem',
                color: '#1C2B4A',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                opacity: state === 'analyzing' ? 0.6 : 1,
                transition: 'opacity 0.3s',
              }}
            />
            <p style={{ fontSize: '0.8rem', color: '#7A8BA0', margin: '8px 0 16px 0', textAlign: 'right' }}>
              ⌘ + Enter to submit
            </p>
            <button
              onClick={handleSubmit}
              disabled={state === 'analyzing' || !message.trim()}
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
                cursor: state === 'analyzing' || !message.trim() ? 'not-allowed' : 'pointer',
                opacity: state === 'analyzing' || !message.trim() ? 0.5 : 1,
                transition: 'opacity 0.2s',
                minHeight: '56px',
              }}
            >
              {state === 'analyzing' ? 'Nora is looking…' : "Get Nora's Second Look"}
            </button>
          </motion.div>
        )}

        {state === 'result' && analysis && (
          <motion.div
            key="result"
            style={{ width: '100%', maxWidth: '560px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <RiskCard
              analysis={analysis}
              onContinue={handleContinue}
              onAskForHelp={handleAskForHelp}
            />
            <button
              onClick={() => { reset(); setMessage('') }}
              style={{
                display: 'block',
                margin: '16px auto 0',
                background: 'none',
                border: 'none',
                color: '#7A8BA0',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              Check another message
            </button>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            style={{ textAlign: 'center', maxWidth: '400px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{ color: '#4A5568', fontSize: '1rem', marginBottom: '20px' }}>
              Something went wrong. Please try again.
            </p>
            <button
              onClick={() => { reset(); setMessage('') }}
              style={{
                padding: '14px 32px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#1C2B4A',
                color: 'white',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1rem',
                cursor: 'pointer',
                minHeight: '52px',
              }}
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low risk silent confirmation (standard/watchful mode) */}
      {state === 'result' && analysis?.risk_level === 'low' && mode !== 'watchful' && (
        <motion.p
          style={{ color: '#2D9F6B', fontSize: '0.9rem', marginTop: '12px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ This one looks fine.
        </motion.p>
      )}
    </div>
  )
}
