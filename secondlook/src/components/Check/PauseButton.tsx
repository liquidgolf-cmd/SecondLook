import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface PauseButtonProps {
  pauseSeconds: number
  onReady?: () => void
  onContinue?: () => void
}

export default function PauseButton({ pauseSeconds, onReady, onContinue }: PauseButtonProps) {
  const [secondsLeft, setSecondsLeft] = useState(pauseSeconds)
  const [isReady, setIsReady] = useState(pauseSeconds === 0)

  useEffect(() => {
    setSecondsLeft(pauseSeconds)
    setIsReady(pauseSeconds === 0)
  }, [pauseSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsReady(true)
      onReady?.()
      return
    }

    const timer = setTimeout(() => {
      setSecondsLeft(s => s - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft, onReady])

  const handleClick = useCallback(() => {
    if (isReady) {
      onContinue?.()
    }
  }, [isReady, onContinue])

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isReady}
      style={{
        width: '100%',
        padding: '14px 24px',
        borderRadius: '999px',
        border: 'none',
        background: '#1C2B4A',
        color: 'white',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '1rem',
        fontWeight: 500,
        cursor: isReady ? 'pointer' : 'default',
        minHeight: '52px',
      }}
      animate={{ opacity: isReady ? 1 : 0.45 }}
      transition={{ duration: 0.6 }}
      aria-label={isReady ? 'Continue' : `Please wait ${secondsLeft} seconds`}
    >
      {isReady
        ? 'Continue anyway'
        : `Please wait… ${secondsLeft}s`}
    </motion.button>
  )
}
