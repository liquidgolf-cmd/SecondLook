import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface NoraOverlayProps {
  isVisible: boolean
  children: ReactNode
}

export default function NoraOverlay({ isVisible, children }: NoraOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Screen softening layer */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="absolute inset-0"
              style={{ backdropFilter: 'brightness(0.92)', backgroundColor: 'rgba(249,246,241,0.2)' }}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            className="fixed inset-0 flex items-end justify-end p-6 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pointer-events-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
