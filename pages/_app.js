import '../styles/globals.css'
import '../styles/components.css'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function App({ Component, pageProps, router }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Socket.io 서버 초기화
    fetch('/api/init-socket')
      .then(() => console.log('Socket.io 서버 초기화 완료'))
      .catch(err => console.error('Socket.io 서버 초기화 실패:', err))
  }, [])

  return (
    <ThemeProvider>
      <div className="app-container">
        <Component {...pageProps} />
        {isClient && <ClientFooter router={router} />}
      </div>
    </ThemeProvider>
  )
}

// 클라이언트에서만 렌더링되는 Footer
function ClientFooter({ router }) {
  const [Footer, setFooter] = useState(null)

  useEffect(() => {
    // 동적 임포트를 useEffect 내에서 실행
    import('../components/layout/Footer').then((module) => {
      setFooter(() => module.default)
    })
  }, [])

  // 게임 방 페이지에서는 Footer 숨기기
  if (router?.pathname?.includes('/room/')) {
    return null
  }

  return Footer ? <Footer /> : <div className="footer-loading">푸터 로딩 중...</div>
}
