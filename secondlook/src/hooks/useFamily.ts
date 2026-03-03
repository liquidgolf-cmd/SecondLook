import { useState, useCallback } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '../lib/firebase'
import type { FamilyConnection } from '../types/user'

interface UseFamilyReturn {
  connections: FamilyConnection[]
  loading: boolean
  fetchConnections: () => Promise<void>
  inviteFamily: (relationship: string, email: string) => Promise<string | null>
  revokeConnection: (connectionId: string) => Promise<void>
  updateNotifySettings: (connectionId: string, notifyOnHighRisk: boolean) => Promise<void>
  acceptInvite: (token: string) => Promise<boolean>
}

export function useFamily(): UseFamilyReturn {
  const [connections, setConnections] = useState<FamilyConnection[]>([])
  const [loading, setLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return
    setLoading(true)

    const seniorQuery = query(
      collection(db, 'familyConnections'),
      where('senior_user_id', '==', user.uid)
    )
    const snap = await getDocs(seniorQuery)
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyConnection))
    setConnections(results)
    setLoading(false)
  }, [])

  const inviteFamily = useCallback(async (relationship: string, email: string): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) return null

    const token = crypto.randomUUID()

    const docRef = await addDoc(collection(db, 'familyConnections'), {
      senior_user_id: user.uid,
      family_user_id: null,
      relationship,
      status: 'pending',
      notify_on_high_risk: true,
      invite_token: token,
      created_at: serverTimestamp(),
    })

    if (!docRef.id) return null

    // Send invite email via Cloud Function
    const notify = httpsCallable(functions, 'notify')
    notify({
      type: 'family_invite',
      inviteToken: token,
      familyEmail: email,
      relationship,
      seniorUid: user.uid,
    }).catch(() => {
      // Silent fail — email is best-effort
    })

    await fetchConnections()
    return token
  }, [fetchConnections])

  const revokeConnection = useCallback(async (connectionId: string) => {
    await updateDoc(doc(db, 'familyConnections', connectionId), { status: 'paused' })
    await fetchConnections()
  }, [fetchConnections])

  const updateNotifySettings = useCallback(async (connectionId: string, notifyOnHighRisk: boolean) => {
    await updateDoc(doc(db, 'familyConnections', connectionId), {
      notify_on_high_risk: notifyOnHighRisk,
    })
    await fetchConnections()
  }, [fetchConnections])

  const acceptInvite = useCallback(async (token: string): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) return false

    const q = query(
      collection(db, 'familyConnections'),
      where('invite_token', '==', token)
    )
    const snap = await getDocs(q)
    if (snap.empty) return false

    const connectionDoc = snap.docs[0]
    await updateDoc(connectionDoc.ref, {
      family_user_id: user.uid,
      status: 'active',
    })
    return true
  }, [])

  return {
    connections,
    loading,
    fetchConnections,
    inviteFamily,
    revokeConnection,
    updateNotifySettings,
    acceptInvite,
  }
}
