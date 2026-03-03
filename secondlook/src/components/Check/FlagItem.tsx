import type { NoraFlag } from '../../types/nora'

interface FlagItemProps {
  flag: NoraFlag
}

const flagLabels: Record<string, string> = {
  urgency_language: 'Urgency language',
  payment_pressure: 'Payment pressure',
  crypto_request: 'Crypto or gift card request',
  secrecy_request: 'Secrecy request',
  authority_impersonation: 'Authority impersonation',
  family_impersonation: 'Family impersonation',
  threat_language: 'Threat language',
  link_suspicion: 'Suspicious link',
}

export default function FlagItem({ flag }: FlagItemProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(28, 43, 74, 0.04)',
        borderLeft: '3px solid #4A8FA8',
      }}
    >
      <p
        style={{
          margin: '0 0 4px 0',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#1C2B4A',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {flagLabels[flag.type] || flag.type.replace(/_/g, ' ')}
      </p>
      <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1C2B4A' }}>
        {flag.plain_english}
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A5568', fontStyle: 'italic' }}>
        {flag.educational_note}
      </p>
    </div>
  )
}
