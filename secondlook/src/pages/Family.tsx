import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFamily } from '../hooks/useFamily'
import type { FamilyConnection } from '../types/user'

export default function Family() {
  const { connections, fetchConnections, inviteFamily, revokeConnection, updateNotifySettings } = useFamily()
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  const handleInvite = async () => {
    if (!email || !relationship) return
    setInviting(true)
    const token = await inviteFamily(relationship, email)
    setInviting(false)
    if (token) {
      setInviteSent(true)
      setEmail('')
      setRelationship('')
      setShowInviteForm(false)
    }
  }

  const activeConnections = connections.filter(c => c.status === 'active')
  const pendingConnections = connections.filter(c => c.status === 'pending')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#1C2B4A', marginBottom: '8px' }}>
            Family & Trusted People
          </h1>
          <p style={{ color: '#4A5568', marginBottom: '32px' }}>
            You decide what they see. They'll never see your messages — only summary counts.
          </p>
        </motion.div>

        {/* Active connections */}
        {activeConnections.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Connected
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {activeConnections.map(conn => (
                <ConnectionCard
                  key={conn.id}
                  connection={conn}
                  onRevoke={() => revokeConnection(conn.id)}
                  onToggleNotify={(v) => updateNotifySettings(conn.id, v)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending invites */}
        {pendingConnections.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Invite Pending
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {pendingConnections.map(conn => (
                <div key={conn.id} style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(28,43,74,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: '#1C2B4A' }}>{conn.relationship}</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#7A8BA0' }}>Invite sent — waiting for them to join</p>
                  </div>
                  <button
                    onClick={() => revokeConnection(conn.id)}
                    style={{ background: 'none', border: 'none', color: '#7A8BA0', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Success message */}
        {inviteSent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(45, 159, 107, 0.1)', marginBottom: '20px' }}
          >
            <p style={{ margin: 0, color: '#2D9F6B', fontSize: '0.95rem' }}>
              Invite sent. They'll receive an email with instructions to join.
            </p>
          </motion.div>
        )}

        {/* Invite form */}
        {showInviteForm ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '24px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)' }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.25rem', color: '#1C2B4A' }}>
              Invite a family member
            </h3>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Their email address"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid #EDE8DF',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1rem',
                color: '#1C2B4A',
                outline: 'none',
                marginBottom: '12px',
              }}
            />
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Who are they? (e.g. daughter, son)"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid #EDE8DF',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1rem',
                color: '#1C2B4A',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleInvite}
                disabled={!email || !relationship || inviting}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#1C2B4A',
                  color: 'white',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '1rem',
                  cursor: !email || !relationship || inviting ? 'not-allowed' : 'pointer',
                  opacity: !email || !relationship || inviting ? 0.5 : 1,
                  minHeight: '52px',
                }}
              >
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                style={{
                  padding: '14px 20px',
                  borderRadius: '999px',
                  border: '1.5px solid #EDE8DF',
                  backgroundColor: 'transparent',
                  color: '#4A5568',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '1rem',
                  cursor: 'pointer',
                  minHeight: '52px',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowInviteForm(true)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1.5px dashed #C8D4DC',
              backgroundColor: 'transparent',
              color: '#4A8FA8',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '56px',
            }}
          >
            + Add a family member or trusted person
          </button>
        )}

        {/* What family sees */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '32px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(74, 143, 168, 0.06)' }}
        >
          <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: '0.875rem', color: '#1C2B4A' }}>What your family members see</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { icon: '✓', text: "Number of messages you've reviewed", show: true },
              { icon: '✓', text: "High-risk events (if you've enabled alerts)", show: true },
              { icon: '✓', text: 'Weekly summary counts', show: true },
              { icon: '✗', text: 'What messages said', show: false },
              { icon: '✗', text: 'Your conversations with Nora', show: false },
              { icon: '✗', text: 'Any message content', show: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: item.show ? '#2D9F6B' : '#C85A5A', fontWeight: 700, fontSize: '0.9rem', marginTop: '1px' }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ConnectionCard({
  connection,
  onRevoke,
  onToggleNotify,
}: {
  connection: FamilyConnection
  onRevoke: () => void
  onToggleNotify: (value: boolean) => void
}) {
  return (
    <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(28,43,74,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#1C2B4A' }}>{connection.relationship}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#2D9F6B' }}>Connected</p>
        </div>
        <button
          onClick={onRevoke}
          style={{ background: 'none', border: 'none', color: '#7A8BA0', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Pause access
        </button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={connection.notify_on_high_risk}
          onChange={e => onToggleNotify(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>
          Alert them when something high-risk is detected
        </span>
      </label>
    </div>
  )
}
