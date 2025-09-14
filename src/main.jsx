import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

console.log('main.jsx 시작됨');

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    게임을 로딩하는 중...
  </div>
)

console.log('React 앱 렌더링 시작');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)

console.log('React 앱 렌더링 완료');
