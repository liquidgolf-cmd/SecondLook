import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'

const resendApiKey = defineSecret('RESEND_API_KEY')
const appUrlSecret = defineSecret('APP_URL')

const RESEND_API_URL = 'https://api.resend.com/emails'

interface NotifyPayload {
  type: 'high_risk_alert' | 'family_invite' | 'weekly_summary'
  eventId?: string
  inviteToken?: string
  familyEmail?: string
  relationship?: string
  seniorUid?: string
}

export const notify = onCall(
  { secrets: [resendApiKey, appUrlSecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    // Always use the authenticated user's uid as the senior (prevents spoofing)
    const seniorUid = request.auth.uid
    const payload = request.data as NotifyPayload

    const resendKey = resendApiKey.value()
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured')
      return { ok: false, reason: 'Email service not configured' }
    }

    // Get senior's profile from Firestore
    const userSnap = await admin.firestore().doc(`users/${seniorUid}`).get()
    const userProfile = userSnap.data()
    const seniorName = userProfile?.first_name || 'Your family member'

    try {
      if (payload.type === 'family_invite' && payload.familyEmail) {
        const appUrl = appUrlSecret.value() || 'https://secondlook.app'
        const inviteUrl = `${appUrl}/family/accept?token=${payload.inviteToken}`

        await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Nora at SecondLook <nora@secondlook.app>',
            to: [payload.familyEmail],
            subject: `${seniorName} has invited you to SecondLook`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1C2B4A;">
                <h2 style="font-style: italic; font-weight: normal;">${seniorName} would like to share safety summaries with you.</h2>
                <p>SecondLook helps ${seniorName} spot unusual patterns in messages and texts. They've invited you as a trusted family member to receive summaries.</p>
                <p style="font-size: 0.9rem; color: #4A5568;">You'll only see summary counts — never the messages themselves. ${seniorName} is always in control of what you see.</p>
                <a href="${inviteUrl}" style="display: inline-block; padding: 14px 28px; background: #1C2B4A; color: white; text-decoration: none; border-radius: 999px; margin: 20px 0; font-family: sans-serif;">
                  Accept invite
                </a>
                <p style="font-size: 0.8rem; color: #7A8BA0;">If you don't recognize this, you can safely ignore this email.</p>
              </div>
            `,
          }),
        })
      }

      if (payload.type === 'high_risk_alert') {
        // Get all active family connections that should be notified
        const connectionsSnap = await admin.firestore()
          .collection('familyConnections')
          .where('senior_user_id', '==', seniorUid)
          .where('status', '==', 'active')
          .where('notify_on_high_risk', '==', true)
          .get()

        for (const connDoc of connectionsSnap.docs) {
          const conn = connDoc.data()
          if (!conn.family_user_id) continue

          // Look up family member's email from Firebase Auth
          try {
            const familyUser = await admin.auth().getUser(conn.family_user_id)
            if (!familyUser.email) continue

            await fetch(RESEND_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Nora at SecondLook <nora@secondlook.app>',
                to: [familyUser.email],
                subject: `SecondLook — ${seniorName} may want to check in`,
                html: `
                  <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1C2B4A;">
                    <h2 style="font-style: italic; font-weight: normal;">A pattern worth noting.</h2>
                    <p>Nora detected a high-risk pattern in a message ${seniorName} reviewed. No action was taken — this is just a heads up.</p>
                    <p style="font-size: 0.9rem; color: #4A5568;">You may want to check in with ${seniorName}. We haven't shared what the message said — only that something unusual was detected.</p>
                    <p style="font-size: 0.8rem; color: #7A8BA0; margin-top: 32px;">You're receiving this because ${seniorName} has connected you as a trusted family member on SecondLook. They can adjust these notifications in their settings at any time.</p>
                  </div>
                `,
              }),
            })
          } catch (err) {
            console.error('Failed to notify family member:', conn.family_user_id, err)
          }
        }

        // Mark the risk event as family-notified
        if (payload.eventId) {
          try {
            await admin.firestore()
              .doc(`users/${seniorUid}/riskEvents/${payload.eventId}`)
              .update({ family_notified: true })
          } catch (err) {
            console.error('Failed to mark event as notified:', err)
          }
        }
      }

      if (payload.type === 'weekly_summary') {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const eventsSnap = await admin.firestore()
          .collection('users').doc(seniorUid).collection('riskEvents')
          .where('created_at', '>', admin.firestore.Timestamp.fromDate(oneWeekAgo))
          .get()

        const total = eventsSnap.size
        const highCount = eventsSnap.docs.filter(d => d.data().risk_level === 'high').length

        // Get all active family connections (weekly summary goes to all connected members)
        const connectionsSnap = await admin.firestore()
          .collection('familyConnections')
          .where('senior_user_id', '==', seniorUid)
          .where('status', '==', 'active')
          .get()

        for (const connDoc of connectionsSnap.docs) {
          const conn = connDoc.data()
          if (!conn.family_user_id) continue

          try {
            const familyUser = await admin.auth().getUser(conn.family_user_id)
            if (!familyUser.email) continue

            await fetch(RESEND_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Nora at SecondLook <nora@secondlook.app>',
                to: [familyUser.email],
                subject: `${seniorName}'s SecondLook Weekly Summary`,
                html: `
                  <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1C2B4A;">
                    <h2 style="font-style: italic; font-weight: normal;">${seniorName}'s SecondLook — Weekly Summary</h2>
                    <div style="background: #F9F6F1; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                      <p style="font-size: 2rem; font-weight: 700; margin: 0;">${total}</p>
                      <p style="font-size: 0.9rem; color: #7A8BA0; margin: 4px 0 0;">messages reviewed this week</p>
                      ${highCount > 0
                        ? `<p style="font-size: 0.9rem; color: #C8A96E; margin: 8px 0 0;">${highCount} needed a closer look</p>`
                        : '<p style="font-size: 0.9rem; color: #2D9F6B; margin: 8px 0 0;">Nothing unusual detected</p>'}
                    </div>
                    <p style="font-size: 0.875rem; color: #4A5568;">This summary shows only counts — never message content. ${seniorName} is always in control of what you see.</p>
                    <p style="font-size: 0.8rem; color: #7A8BA0; margin-top: 32px;">You're receiving this because you're connected as a trusted family member on SecondLook.</p>
                  </div>
                `,
              }),
            })
          } catch (err) {
            console.error('Failed to send weekly summary to family member:', err)
          }
        }
      }

      return { ok: true }
    } catch (err) {
      console.error('Notify function error:', err)
      return { ok: false }
    }
  }
)
