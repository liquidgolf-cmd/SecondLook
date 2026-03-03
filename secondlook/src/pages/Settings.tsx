import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useUser } from '../hooks/useUser'
import type { Mode } from '../types/nora'
import type { FamilyShareLevel } from '../types/user'

const modeDescriptions: Record<Mode, string> = {
  gentle: 'Only step in when something looks high-risk.',
  standard: 'Flag suspicious patterns when something looks unusual.',
  watchful: 'Help me double-check more often.',
}

export default function Settings() {
  const navigate = useNavigate()
  const { profile, updateProfile, signOut } = useUser()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!profile) return null

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Delete Firestore user document (riskEvents subcollection remains but is inaccessible)
      await deleteDoc(doc(db, 'users', profile.id))
      // Delete Firebase Auth account
      const currentUser = auth.currentUser
      if (currentUser) {
        await deleteUser(currentUser)
      }
    } catch {
      // best effort — navigate home regardless
    }
    navigate('/')
  }

  const shareLevelOptions: { value: FamilyShareLevel; label: string; description: string }[] = [
    { value: 'none', label: 'Private', description: "Don't share anything with family." },
    { value: 'high_risk_only', label: 'High-risk alerts only', description: 'Notify family only when a high-risk pattern is detected.' },
    { value: 'weekly_summary', label: 'Weekly summaries', description: 'Share a weekly count summary with connected family members.' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '32px' }}
        >
          Settings
        </motion.h1>

        {/* Name */}
        <SettingSection title="Your name">
          <input
            type="text"
            defaultValue={profile.first_name}
            onBlur={e => updateProfile({ first_name: e.target.value })}
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
            }}
          />
        </SettingSection>

        {/* Mode */}
        <SettingSection title="Nora's mode">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['gentle', 'standard', 'watchful'] as Mode[]).map(m => (
              <label
                key={m}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${profile.mode === m ? '#1C2B4A' : '#EDE8DF'}`,
                  backgroundColor: profile.mode === m ? 'rgba(28, 43, 74, 0.04)' : 'white',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={profile.mode === m}
                  onChange={() => updateProfile({ mode: m })}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '0.95rem', color: '#1C2B4A', textTransform: 'capitalize' }}>{m}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A5568' }}>{modeDescriptions[m]}</p>
                </div>
              </label>
            ))}
          </div>
        </SettingSection>

        {/* Family sharing */}
        <SettingSection title="What family can see">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {shareLevelOptions.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${profile.family_share_level === opt.value ? '#1C2B4A' : '#EDE8DF'}`,
                  backgroundColor: profile.family_share_level === opt.value ? 'rgba(28, 43, 74, 0.04)' : 'white',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="share_level"
                  value={opt.value}
                  checked={profile.family_share_level === opt.value}
                  onChange={() => updateProfile({ family_share_level: opt.value })}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '0.95rem', color: '#1C2B4A' }}>{opt.label}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A5568' }}>{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </SettingSection>

        {/* Plan */}
        <SettingSection title="Your plan">
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'white', border: '1.5px solid #EDE8DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#1C2B4A', textTransform: 'capitalize' }}>{profile.plan}</p>
              {profile.plan === 'trial' && (
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#7A8BA0' }}>5 free message checks included</p>
              )}
            </div>
            {profile.plan === 'trial' && (
              <button
                onClick={() => navigate('/upgrade')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#1C2B4A',
                  color: 'white',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Upgrade
              </button>
            )}
          </div>
        </SettingSection>

        {/* Danger zone */}
        <SettingSection title="Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={signOut}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid #EDE8DF',
                backgroundColor: 'transparent',
                color: '#1C2B4A',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1rem',
                cursor: 'pointer',
                minHeight: '52px',
              }}
            >
              Sign out
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1.5px solid #EDE8DF',
                  backgroundColor: 'transparent',
                  color: '#C85A5A',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  minHeight: '52px',
                }}
              >
                Delete all my data
              </button>
            ) : (
              <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid #C85A5A', backgroundColor: 'rgba(200, 90, 90, 0.05)' }}>
                <p style={{ margin: '0 0 12px 0', color: '#1C2B4A', fontSize: '0.95rem' }}>
                  This will permanently delete your account and all data. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: '#C85A5A',
                      color: 'white',
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: '0.95rem',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.7 : 1,
                      minHeight: '48px',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '999px',
                      border: '1.5px solid #EDE8DF',
                      backgroundColor: 'transparent',
                      color: '#4A5568',
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      minHeight: '48px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </SettingSection>
      </div>
    </div>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: '24px' }}
    >
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px 0' }}>
        {title}
      </p>
      {children}
    </motion.div>
  )
}
