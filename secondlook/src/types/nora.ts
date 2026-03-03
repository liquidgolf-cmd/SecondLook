export type RiskLevel = 'low' | 'medium' | 'high'

export type FlagType =
  | 'urgency_language'
  | 'payment_pressure'
  | 'crypto_request'
  | 'secrecy_request'
  | 'authority_impersonation'
  | 'family_impersonation'
  | 'threat_language'
  | 'link_suspicion'

export type Mode = 'gentle' | 'standard' | 'watchful'

export interface NoraFlag {
  type: FlagType
  plain_english: string
  educational_note: string
}

export interface NoraAnalysis {
  risk_level: RiskLevel
  nora_message: string
  flags: NoraFlag[]
  recommended_actions: string[]
  pause_seconds: number
}

export type AnalysisState = 'idle' | 'analyzing' | 'result' | 'error'
