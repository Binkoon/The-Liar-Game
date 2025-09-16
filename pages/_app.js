import '../styles/globals.css'
import '../styles/components.css'
import { useEffect } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Socket.io 서버 초기화
    fetch('/api/init-socket')
      .then(() => console.log('Socket.io 서버 초기화 완료'))
      .catch(err => console.error('Socket.io 서버 초기화 실패:', err))
  }, [])

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
