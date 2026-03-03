import type { Mode } from './nora'

export type Plan = 'trial' | 'personal' | 'family'
export type FamilyShareLevel = 'none' | 'high_risk_only' | 'weekly_summary'
export type FamilyStatus = 'pending' | 'active' | 'paused'

export interface UserProfile {
  id: string
  first_name: string
  mode: Mode
  voice_enabled: boolean
  family_share_level: FamilyShareLevel
  stripe_customer_id: string | null
  plan: Plan
  created_at: string
}

export interface FamilyConnection {
  id: string
  senior_user_id: string
  family_user_id: string
  relationship: string
  status: FamilyStatus
  notify_on_high_risk: boolean
  invite_token: string
}

export interface RiskEvent {
  id: string
  user_id: string
  risk_level: 'low' | 'medium' | 'high'
  flag_types: string[]
  user_action: 'paused' | 'continued' | 'contacted_family' | null
  family_notified: boolean
  created_at: string
}
