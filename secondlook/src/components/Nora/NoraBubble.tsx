import { motion } from 'framer-motion'
import NoraAvatar from './NoraAvatar'

interface NoraBubbleProps {
  message?: string
  isActive?: boolean
}

export default function NoraBubble({
  message = "Let's take a second look.",
  isActive = false,
}: NoraBubbleProps) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NoraAvatar size="sm" isActive={isActive} />
      <p
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '1.125rem',
          color: '#1C2B4A',
          margin: 0,
        }}
      >
        {message}
      </p>
    </motion.div>
  )
}
