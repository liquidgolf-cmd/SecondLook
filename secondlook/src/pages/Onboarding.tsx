import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NoraAvatar from '../components/Nora/NoraAvatar'
import { useUser } from '../hooks/useUser'
import type { Mode } from '../types/nora'
import { useFamily } from '../hooks/useFamily'

const TOTAL_STEPS = 6

const modes: { value: Mode; label: string; quote: string; description: string }[] = [
  {
    value: 'gentle',
    label: 'Gentle',
    quote: '"Only step in when something looks high-risk."',
    description: 'Nora stays quiet unless she spots a serious concern.',
  },
  {
    value: 'standard',
    label: 'Standard',
    quote: '"Give me a second opinion when something looks unusual."',
    description: 'Nora flags suspicious patterns and explains them calmly.',
  },
  {
    value: 'watchful',
    label: 'Watchful',
    quote: '"Help me double-check more often."',
    description: 'Nora reviews everything and keeps your family in the loop.',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { updateProfile } = useUser()
  const { inviteFamily } = useFamily()

  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [selectedMode, setSelectedMode] = useState<Mode>('standard')
  const [familyEmail, setFamilyEmail] = useState('')
  const [familyRelationship, setFamilyRelationship] = useState('')
  const [showGreeting, setShowGreeting] = useState(false)
  const [saving, setSaving] = useState(false)

  const next = () => {
    if (step === 2 && !showGreeting) {
      setShowGreeting(true)
      setTimeout(() => setStep(s => s + 1), 2500)
      return
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  const back = () => {
    setStep(s => Math.max(s - 1, 1))
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await updateProfile({
        first_name: firstName.trim(),
        mode: selectedMode,
        voice_enabled: false, // voice deferred to v2
        family_share_level: familyEmail ? 'high_risk_only' : 'none',
        plan: 'trial',
      })
      if (familyEmail && familyRelationship) {
        await inviteFamily(familyRelationship, familyEmail)
      }
      navigate('/check')
    } finally {
      setSaving(false)
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
      {/* Dot progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: i + 1 <= step ? '#1C2B4A' : '#EDE8DF',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '480px' }}>
        <AnimatePresence mode="wait">
          {/* Step 1: First name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', color: '#1C2B4A', marginBottom: '8px' }}>
                What's your first name?
              </h1>
              <p style={{ color: '#4A5568', marginBottom: '32px' }}>Nora will use it to greet you personally.</p>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && firstName.trim() && next()}
                placeholder="Your first name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #EDE8DF',
                  backgroundColor: 'white',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '1.25rem',
                  color: '#1C2B4A',
                  outline: 'none',
                  marginBottom: '24px',
                }}
              />
              <PrimaryButton onClick={next} disabled={!firstName.trim()}>Continue</PrimaryButton>
            </motion.div>
          )}

          {/* Step 2: Nora's greeting */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}
            >
              <NoraAvatar size="lg" isActive={showGreeting} />
              <AnimatePresence>
                {showGreeting && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontStyle: 'italic',
                      fontSize: '1.25rem',
                      color: '#1C2B4A',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    Hi {firstName}. Think of me as a quiet safety net — here whenever you'd like a second look.
                  </motion.p>
                )}
              </AnimatePresence>
              {!showGreeting && (
                <PrimaryButton onClick={next}>Meet Nora</PrimaryButton>
              )}
            </motion.div>
          )}

          {/* Step 3: Mode selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '8px' }}>
                How much would you like Nora's help?
              </h2>
              <p style={{ color: '#4A5568', marginBottom: '24px' }}>You can change this anytime in Settings.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {modes.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMode(m.value)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: `2px solid ${selectedMode === m.value ? '#1C2B4A' : '#EDE8DF'}`,
                      backgroundColor: selectedMode === m.value ? 'rgba(28, 43, 74, 0.04)' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                  >
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem', color: '#1C2B4A' }}>{m.label}</p>
                    <p style={{ margin: '0 0 4px 0', fontStyle: 'italic', fontSize: '0.875rem', color: '#4A5568' }}>{m.quote}</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#7A8BA0' }}>{m.description}</p>
                  </button>
                ))}
              </div>
              <PrimaryButton onClick={next}>Continue</PrimaryButton>
            </motion.div>
          )}

          {/* Step 4: Family invite (optional) */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '8px' }}>
                Would you like to share safety summaries with a family member?
              </h2>
              <p style={{ color: '#4A5568', marginBottom: '24px' }}>
                They'll receive weekly summaries — never the messages themselves. You're always in control of what they see.
              </p>
              <input
                type="email"
                value={familyEmail}
                onChange={e => setFamilyEmail(e.target.value)}
                placeholder="Family member's email address"
                style={{
                  width: '100%',
                  padding: '14px 18px',
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
              {familyEmail && (
                <input
                  type="text"
                  value={familyRelationship}
                  onChange={e => setFamilyRelationship(e.target.value)}
                  placeholder="Who are they to you? (e.g. daughter, son)"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1.5px solid #EDE8DF',
                    backgroundColor: 'white',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: '1rem',
                    color: '#1C2B4A',
                    outline: 'none',
                    marginBottom: '24px',
                  }}
                />
              )}
              {!familyEmail && <div style={{ marginBottom: '24px' }} />}
              <PrimaryButton onClick={next}>
                {familyEmail ? 'Send invite' : 'Continue'}
              </PrimaryButton>
              <button
                onClick={next}
                style={{
                  display: 'block',
                  margin: '12px auto 0',
                  background: 'none',
                  border: 'none',
                  color: '#7A8BA0',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                Maybe later
              </button>
            </motion.div>
          )}

          {/* Step 5: Voice preference */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '8px' }}>
                Would you like Nora to speak her guidance aloud?
              </h2>
              <p style={{ color: '#4A5568', marginBottom: '32px' }}>
                Nora's voice is generated privately. She does not listen. Voice guidance is coming soon — we'll let you know when it's ready.
              </p>
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(74, 143, 168, 0.08)',
                  marginBottom: '32px',
                }}
              >
                <p style={{ margin: 0, color: '#4A8FA8', fontSize: '0.95rem' }}>
                  Voice guidance is coming in a future update. Your preference will be saved.
                </p>
              </div>
              <PrimaryButton onClick={next}>Continue</PrimaryButton>
            </motion.div>
          )}

          {/* Step 6: Privacy transparency */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '8px' }}>
                What SecondLook stores
              </h2>
              <p style={{ color: '#4A5568', marginBottom: '24px' }}>We believe you should know exactly what we keep.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { icon: '🔍', label: 'What Nora scans', value: 'Payment requests, urgency language, crypto references, impersonation patterns' },
                  { icon: '🚫', label: 'What we never store', value: 'Your messages, conversations, or anything you paste' },
                  { icon: '🔐', label: 'What we store', value: 'Whether a message was flagged, not what it said' },
                  { icon: '🗑️', label: 'Delete everything', value: 'One tap in Settings removes all your data instantly' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '0.875rem', color: '#1C2B4A' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A5568' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data snapshot */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(28, 43, 74, 0.04)', display: 'flex', justifyContent: 'space-around', marginBottom: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1C2B4A' }}>0</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A8BA0' }}>Messages stored</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1C2B4A' }}>0</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A8BA0' }}>Events logged</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1C2B4A' }}>0</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A8BA0' }}>Shared with family</p>
                </div>
              </div>

              <PrimaryButton onClick={handleFinish} disabled={saving}>
                {saving ? 'Setting up Nora…' : "I'm ready — let's go"}
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 1 && step < 6 && (
          <button
            onClick={back}
            style={{
              display: 'block',
              margin: '20px auto 0',
              background: 'none',
              border: 'none',
              color: '#7A8BA0',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        minHeight: '56px',
        transition: 'opacity 0.2s',
      }}
    >
      {children}
    </button>
  )
}
