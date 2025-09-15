import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // 프로덕션 빌드 시 콘솔 로그와 debugger 제거
    drop: ['console', 'debugger']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          // Framer Motion을 별도 청크로 분리 (크기가 큼)
          framer: ['framer-motion'],
          // Valtio 상태 관리
          store: ['valtio'],
          // 게임 컴포넌트들을 청크로 분리
          'game-phases': [
            './src/components/TopicSelection.jsx',
            './src/components/RoleAssignment.jsx',
            './src/components/ExplanationPhase.jsx',
            './src/components/VotingPhase.jsx',
            './src/components/WithdrawalPhase.jsx',
            './src/components/GameResult.jsx'
          ],
          // 공통 컴포넌트들
          'common-components': [
            './src/components/Lobby.jsx',
            './src/components/Chat.jsx',
            './src/components/Modal.jsx'
          ]
        }
      }
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000
  }
})
