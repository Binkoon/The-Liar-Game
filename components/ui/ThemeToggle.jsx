import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className={`theme-toggle loading ${className}`}>
        <div className="toggle-skeleton"></div>
      </div>
    )
  }

  return (
    <motion.button
      className={`theme-toggle ${theme} ${className}`}
      onClick={toggleTheme}
      whileHover={{ 
        scale: 1.08, 
        y: -1,
        transition: { 
          duration: 0.3, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      }}
      whileTap={{ 
        scale: 0.96,
        y: 0,
        transition: { 
          duration: 0.15, 
          ease: [0.25, 0.1, 0.25, 1] 
        }
      }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      <div className="toggle-track">
        <motion.div
          className="toggle-thumb"
          animate={{
            x: theme === 'light' ? 0 : 24,
            backgroundColor: theme === 'light' ? '#ffffff' : '#f9ab00'
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.1, 0.25, 1] 
          }}
        >
          <span className="toggle-icon">
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </motion.div>
      </div>
      <span className="toggle-label">
        {theme === 'light' ? '라이트' : '다크'}
      </span>
    </motion.button>
  )
}

export default ThemeToggle
