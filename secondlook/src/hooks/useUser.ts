import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile } from '../types/user'

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        await ensureProfileExists(firebaseUser.uid)
        await fetchProfile(firebaseUser.uid)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const ensureProfileExists = async (uid: string) => {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      // Auto-create profile on first login (mirrors the old SQL trigger)
      await setDoc(userRef, {
        first_name: '',
        mode: 'standard',
        voice_enabled: false,
        family_share_level: 'none',
        plan: 'trial',
        stripe_customer_id: null,
        created_at: serverTimestamp(),
      })
    }
  }

  const fetchProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      setProfile({ id: uid, ...snap.data() } as UserProfile)
    }
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    // Strip 'id' — not a Firestore field
    const { id: _id, ...firestoreUpdates } = updates as UserProfile & { id?: string }
    await setDoc(userRef, firestoreUpdates, { merge: true })
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return { user, profile, loading, updateProfile, signOut }
}
