import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

/**
 * Triggered when a new Firebase Auth user is created.
 * Creates the corresponding Firestore user document with defaults.
 * This acts as a server-side safety net — the client hook useUser.ts
 * also calls ensureProfileExists() which handles the common case.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userRef = admin.firestore().doc(`users/${user.uid}`)

  // Only create if it doesn't already exist (client may have beaten us here)
  const snap = await userRef.get()
  if (!snap.exists) {
    await userRef.set({
      first_name: '',
      mode: 'standard',
      voice_enabled: false,
      family_share_level: 'none',
      plan: 'trial',
      stripe_customer_id: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })
  }
})
