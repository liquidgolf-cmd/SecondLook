import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/check', label: 'Check', icon: '🔍' },
  { path: '/dashboard', label: 'Summary', icon: '📋' },
  { path: '/family', label: 'Family', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #EDE8DF',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
        zIndex: 100,
      }}
      aria-label="Main navigation"
    >
      {navItems.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              minHeight: '52px',
              minWidth: '60px',
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1C2B4A' : '#7A8BA0',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
