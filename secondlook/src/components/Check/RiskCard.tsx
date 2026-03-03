import { motion } from 'framer-motion'
import type { NoraAnalysis } from '../../types/nora'
import FlagItem from './FlagItem'
import PauseButton from './PauseButton'

interface RiskCardProps {
  analysis: NoraAnalysis
  onContinue?: () => void
  onAskForHelp?: () => void
  helpRequested?: boolean
}

const topBarColor: Record<string, string> = {
  low: '#4A8FA8',    // teal
  medium: '#C8A96E', // amber
  high: '#1C2B4A',   // navy — never red
}

export default function RiskCard({ analysis, onContinue, onAskForHelp, helpRequested }: RiskCardProps) {
  const barColor = topBarColor[analysis.risk_level] || '#4A8FA8'

  return (
    <motion.div
      style={{
        borderRadius: '20px',
        backgroundColor: 'white',
        boxShadow: '0 4px 24px rgba(28, 43, 74, 0.10)',
        overflow: 'hidden',
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Color bar */}
      <div style={{ height: '6px', backgroundColor: barColor }} />

      <div style={{ padding: '24px' }}>
        {/* Nora's message */}
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '1.125rem',
            color: '#1C2B4A',
            margin: '0 0 20px 0',
            lineHeight: 1.5,
          }}
        >
          {analysis.nora_message}
        </p>

        {/* Flags */}
        {analysis.flags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {analysis.flags.map((flag, i) => (
              <FlagItem key={i} flag={flag} />
            ))}
          </div>
        )}

        {/* Recommended actions */}
        {analysis.recommended_actions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A8BA0', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 0' }}>
              You might consider
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.recommended_actions.map((action, i) => (
                <li key={i}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#4A8FA8',
                      fontSize: '0.95rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {action}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PauseButton
            pauseSeconds={analysis.pause_seconds}
            onContinue={onContinue}
          />
          {helpRequested ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#F0F7F5',
                border: '1px solid #C0DDD5',
              }}
            >
              <p style={{
                margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#1C2B4A',
                lineHeight: 1.55,
              }}>
                Good thinking. If you have a family contact set up, they've been notified. Otherwise, consider reaching out to someone you trust.
              </p>
            </motion.div>
          ) : (
            <button
              onClick={onAskForHelp}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '999px',
                border: '1.5px solid #1C2B4A',
                background: 'transparent',
                color: '#1C2B4A',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                minHeight: '52px',
              }}
            >
              I'd like some help
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
