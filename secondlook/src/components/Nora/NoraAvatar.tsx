import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface NoraAvatarProps {
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
  showRing?: boolean
  progressDuration?: number
  onComplete?: () => void
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
}

const fontSizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
}

export default function NoraAvatar({
  isActive = false,
  size = 'md',
  showRing = false,
  progressDuration,
  onComplete,
}: NoraAvatarProps) {
  const px = sizeMap[size]
  const fontSize = fontSizeMap[size]
  const radius = px / 2 - 4
  const circumference = 2 * Math.PI * radius
  const progressControls = useAnimation()
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Progress ring animation
  useEffect(() => {
    if (progressDuration && progressDuration > 0) {
      progressControls.set({ strokeDashoffset: circumference })
      progressControls.start({
        strokeDashoffset: 0,
        transition: { duration: progressDuration, ease: 'linear' },
      }).then(() => {
        onCompleteRef.current?.()
      })
    }
  }, [progressDuration, circumference, progressControls])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: px, height: px }}>
      {/* Glow ring */}
      {showRing && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 0 4px rgba(74, 143, 168, 0.3)',
            borderRadius: '50%',
          }}
        />
      )}

      {/* SVG progress ring */}
      {progressDuration && progressDuration > 0 && (
        <svg
          className="absolute inset-0"
          width={px}
          height={px}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke="rgba(74,143,168,0.15)"
            strokeWidth={3}
          />
          {/* Progress ring */}
          <motion.circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke="#4A8FA8"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={progressControls}
          />
        </svg>
      )}

      {/* Avatar circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: px,
          height: px,
          background: 'linear-gradient(135deg, #4A8FA8 0%, #1C2B4A 100%)',
          fontSize,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 600,
          color: 'white',
          zIndex: 1,
        }}
        animate={
          isActive
            ? {
                scale: [1, 1.03, 1],
                opacity: [0.9, 0.7, 0.9],
              }
            : { scale: 1, opacity: 1 }
        }
        transition={
          isActive
            ? {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.4 }
        }
      >
        N
      </motion.div>
    </div>
  )
}
