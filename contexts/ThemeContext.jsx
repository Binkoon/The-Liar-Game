import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(true)

  // 로컬 스토리지에서 테마 설정 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem('liar-game-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setIsLoading(false)
  }, [])

  // 테마 변경 시 로컬 스토리지에 저장
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('liar-game-theme', newTheme)
  }

  // 다크모드 설정
  const setDarkMode = () => {
    setTheme('dark')
    localStorage.setItem('liar-game-theme', 'dark')
  }

  // 라이트모드 설정
  const setLightMode = () => {
    setTheme('light')
    localStorage.setItem('liar-game-theme', 'light')
  }

  const value = {
    theme,
    toggleTheme,
    setDarkMode,
    setLightMode,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
