import { useState, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, functions } from '../lib/firebase'
import type { NoraAnalysis, AnalysisState, Mode } from '../types/nora'

interface UseNoraReturn {
  analysis: NoraAnalysis | null
  state: AnalysisState
  analyze: (message: string, mode: Mode, userName: string) => Promise<void>
  reset: () => void
  logUserAction: (action: 'paused' | 'continued' | 'contacted_family') => Promise<void>
}

export function useNora(): UseNoraReturn {
  const [analysis, setAnalysis] = useState<NoraAnalysis | null>(null)
  const [state, setState] = useState<AnalysisState>('idle')
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const analyze = useCallback(async (message: string, mode: Mode, userName: string) => {
    setState('analyzing')
    setAnalysis(null)
    setLastEventId(null)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')

      // Call the Firebase Cloud Function — auth token is passed automatically
      const analyzeMessage = httpsCallable<
        { message: string; mode: Mode; userName: string },
        NoraAnalysis
      >(functions, 'analyze')

      const result = await analyzeMessage({ message, mode, userName })
      const analysisResult = result.data

      setAnalysis(analysisResult)
      setState('result')

      // Log risk_event metadata to Firestore — NO message content stored
      const eventsRef = collection(db, 'users', user.uid, 'riskEvents')
      const eventDoc = await addDoc(eventsRef, {
        risk_level: analysisResult.risk_level,
        flag_types: analysisResult.flags.map(f => f.type),
        user_action: null,
        family_notified: false,
        created_at: serverTimestamp(),
      })
      setLastEventId(eventDoc.id)

      // Trigger family notification for high-risk events
      if (analysisResult.risk_level === 'high') {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        const userProfile = userSnap.data()

        if (
          userProfile &&
          (userProfile.family_share_level === 'high_risk_only' ||
            userProfile.family_share_level === 'weekly_summary')
        ) {
          // Fire and forget — don't block the UI
          const notify = httpsCallable(functions, 'notify')
          notify({
            type: 'high_risk_alert',
            eventId: eventDoc.id,
            seniorUid: user.uid,
          }).catch(() => {
            // Silent fail — notification is best-effort
          })
        }
      }
    } catch {
      setState('error')
    }
  }, [])

  const logUserAction = useCallback(async (action: 'paused' | 'continued' | 'contacted_family') => {
    const user = auth.currentUser
    if (!user || !lastEventId) return
    const eventRef = doc(db, 'users', user.uid, 'riskEvents', lastEventId)
    await updateDoc(eventRef, { user_action: action })
  }, [lastEventId])

  const reset = useCallback(() => {
    setAnalysis(null)
    setState('idle')
    setLastEventId(null)
  }, [])

  return { analysis, state, analyze, reset, logUserAction }
}
