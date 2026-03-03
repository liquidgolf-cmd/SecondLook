import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useUser } from '../hooks/useUser'
import type { RiskEvent } from '../types/user'
import type { Mode } from '../types/nora'
import NoraAvatar from '../components/Nora/NoraAvatar'

const modeLabels: Record<Mode, string> = {
  gentle: 'Gentle',
  standard: 'Standard',
  watchful: 'Watchful',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useUser()
  const [recentEvents, setRecentEvents] = useState<RiskEvent[]>([])
  const [weeklyCount, setWeeklyCount] = useState({ total: 0, high: 0 })
  const [totalEvents, setTotalEvents] = useState(0)

  useEffect(() => {
    if (!profile) return
    fetchEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const fetchEvents = async () => {
    const user = auth.currentUser
    if (!user) return

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const eventsQuery = query(
      collection(db, 'users', user.uid, 'riskEvents'),
      orderBy('created_at', 'desc'),
      limit(10)
    )
    const snap = await getDocs(eventsQuery)

    const results: RiskEvent[] = snap.docs.map(d => {
      const data = d.data()
      // Convert Firestore Timestamp to ISO string
      const ts = data.created_at as Timestamp | null
      const created_at = ts?.toDate?.()?.toISOString() ?? new Date().toISOString()
      return {
        id: d.id,
        user_id: user.uid,
        risk_level: data.risk_level,
        flag_types: data.flag_types ?? [],
        user_action: data.user_action ?? null,
        family_notified: data.family_notified ?? false,
        created_at,
      } as RiskEvent
    })

    setRecentEvents(results)
    setTotalEvents(results.length)
    const weeklyEvents = results.filter(e => new Date(e.created_at) > oneWeekAgo)
    setWeeklyCount({
      total: weeklyEvents.length,
      high: weeklyEvents.filter(e => e.risk_level === 'high').length,
    })
  }

  const handleModeChange = async (mode: Mode) => {
    await updateProfile({ mode })
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7A8BA0' }}>Loading…</p>
      </div>
    )
  }

  const modes: Mode[] = ['gentle', 'standard', 'watchful']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6F1', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}
        >
          <NoraAvatar size="sm" />
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', color: '#1C2B4A' }}>
              Hi {profile.first_name}.
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#7A8BA0' }}>Here's your SecondLook summary.</p>
          </div>
        </motion.div>

        {/* Weekly summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: '24px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)', marginBottom: '16px' }}
        >
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            This Week
          </p>
          {weeklyCount.total === 0 ? (
            <p style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.125rem', color: '#1C2B4A' }}>
              No unusual patterns this week.
            </p>
          ) : (
            <>
              <p style={{ margin: '0 0 8px 0', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.125rem', color: '#1C2B4A' }}>
                {weeklyCount.total} message{weeklyCount.total !== 1 ? 's' : ''} reviewed.
                {weeklyCount.high > 0 ? ` ${weeklyCount.high} needed a closer look.` : ' All looked fine.'}
              </p>
            </>
          )}
        </motion.div>

        {/* Data transparency */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ padding: '20px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)', marginBottom: '16px' }}
        >
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your Data
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1C2B4A' }}>0</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A8BA0' }}>Messages stored</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1C2B4A' }}>{totalEvents}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A8BA0' }}>Events logged</p>
            </div>
          </div>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '20px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)', marginBottom: '16px' }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nora's Mode
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {modes.map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: `1.5px solid ${profile.mode === m ? '#1C2B4A' : '#EDE8DF'}`,
                  backgroundColor: profile.mode === m ? 'rgba(28, 43, 74, 0.06)' : 'transparent',
                  color: '#1C2B4A',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: profile.mode === m ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity feed */}
        {recentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ padding: '20px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 2px 12px rgba(28,43,74,0.08)', marginBottom: '16px' }}
          >
            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Activity
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEvents.slice(0, 5).map(event => (
                <div key={event.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EDE8DF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: event.risk_level === 'high' ? '#1C2B4A' : event.risk_level === 'medium' ? '#C8A96E' : '#4A8FA8',
                    }} />
                    <span style={{ fontSize: '0.9rem', color: '#4A5568' }}>
                      {event.risk_level === 'low' ? 'No concerns' : event.risk_level === 'medium' ? 'Worth a look' : 'Needed attention'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#7A8BA0' }}>
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <button
            onClick={() => navigate('/check')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#1C2B4A',
              color: 'white',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              minHeight: '52px',
            }}
          >
            Check a message
          </button>
          <button
            onClick={() => navigate('/settings')}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '16px',
              border: '1.5px solid #EDE8DF',
              backgroundColor: 'white',
              color: '#1C2B4A',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.95rem',
              cursor: 'pointer',
              minHeight: '52px',
            }}
          >
            Settings
          </button>
        </motion.div>
      </div>
    </div>
  )
}
