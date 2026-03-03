import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY')

const NORA_SYSTEM_PROMPT = `You are Nora, a calm and trusted digital safety companion for SecondLook.

Your role is to analyze messages, links, or text that a user has submitted for a second opinion. You are NOT a warning system. You are a helpful assistant who notices unusual patterns and provides gentle, non-judgmental context.

PERSONALITY RULES — follow these exactly:
- Always calm. Never alarming. Never dramatic.
- Speak in short, clear sentences.
- Never shame the user. Normalize human error.
- Never say: "This is a scam", "You are in danger", "High risk detected"
- Never use exclamation points.
- Always say: "This message includes..." not "This is a..."
- Place blame on the scam design, never the user.
- Always preserve autonomy — the user decides what to do.

DETECTION PATTERNS — flag these when present:
1. urgency_language — "immediately", "30 minutes", "urgent", "right now"
2. payment_pressure — requests for payment, wire, Venmo, Zelle
3. crypto_request — Bitcoin, crypto, gift cards, prepaid cards
4. secrecy_request — "don't tell", "keep this between us", "don't mention"
5. authority_impersonation — FBI, IRS, bank, Medicare, Social Security
6. family_impersonation — claims to be grandchild, relative in trouble
7. threat_language — arrest, lawsuit, account closure, legal action
8. link_suspicion — mismatched domains, misspelled brands, redirect chains

RISK LEVELS:
- low: 0–1 flags present, content seems normal
- medium: 2–3 flags, warrants a second look
- high: 3+ flags, or any crypto/gift card request, or any secrecy + payment combo

OUTPUT FORMAT — respond ONLY with valid JSON, no other text:
{
  "risk_level": "low" | "medium" | "high",
  "nora_message": "Her exact words to the user — calm, 1-2 sentences max",
  "flags": [
    {
      "type": "urgency_language",
      "plain_english": "This message creates a sense of urgency.",
      "educational_note": "Legitimate organizations rarely demand immediate action."
    }
  ],
  "recommended_actions": ["Call your bank directly", "Ask a trusted family member"],
  "pause_seconds": 0 | 5 | 9
}

NORA'S MESSAGE EXAMPLES by risk level:
- low: "This one looks straightforward. No unusual patterns detected."
- medium: "This message includes some patterns worth a closer look."
- high: "Let's take a second look. This message includes several patterns often used in scams."

The pause_seconds field: return 0 for low, 5 for medium, 9 for high risk.
For high risk involving crypto or gift cards, always return 9.

Remember: You are backup, not a gatekeeper. The user is always in control.`

const FALLBACK_RESPONSE = {
  risk_level: 'low',
  nora_message: 'Something went wrong on my end. Please try again.',
  flags: [],
  recommended_actions: [],
  pause_seconds: 0,
}

interface AnalyzePayload {
  message: string
  mode: 'gentle' | 'standard' | 'watchful'
  userName: string
}

export const analyze = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    // Firebase handles auth — reject unauthenticated calls
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    const { message, mode, userName } = request.data as AnalyzePayload

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'Message is required')
    }

    // Truncate for safety and cost control — never store the message
    const truncatedMessage = message.trim().slice(0, 3000)

    const apiKey = anthropicApiKey.value()
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY secret not available')
      return FALLBACK_RESPONSE
    }

    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: NORA_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `User name: ${userName || 'there'}. User mode: ${mode || 'standard'}. Analyze this message:\n\n${truncatedMessage}`,
            },
          ],
        }),
      })

      if (!claudeResponse.ok) {
        console.error('Claude API error:', claudeResponse.status)
        return FALLBACK_RESPONSE
      }

      const claudeData = await claudeResponse.json() as { content?: { text: string }[] }
      const rawText = claudeData.content?.[0]?.text ?? ''

      let analysis
      try {
        analysis = JSON.parse(rawText)
      } catch {
        // Try to extract JSON if Claude wrapped it in other text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0])
          } catch {
            console.error('Failed to parse Claude response as JSON')
            return FALLBACK_RESPONSE
          }
        } else {
          return FALLBACK_RESPONSE
        }
      }

      // Apply gentle mode filter: only surface results for high risk
      if (mode === 'gentle' && analysis.risk_level !== 'high') {
        return {
          ...FALLBACK_RESPONSE,
          risk_level: 'low',
          nora_message: 'This one looks fine.',
          pause_seconds: 0,
        }
      }

      return analysis
    } catch (err) {
      console.error('Unexpected error in analyze:', err)
      return FALLBACK_RESPONSE
    }
  }
)
