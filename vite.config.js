import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // 프로덕션 빌드 시 콘솔 로그와 debugger 제거
    drop: ['console', 'debugger'],
    // 브라우저 호환성을 위한 타겟 설정
    target: 'es2015'
  },
  build: {
    // 브라우저 호환성을 위한 타겟 설정
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules를 별도 청크로 분리
          if (id.includes('node_modules')) {
            // React 관련 라이브러리들
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Framer Motion (크기가 큼)
            if (id.includes('framer-motion')) {
              return 'framer';
            }
            // Valtio 상태 관리
            if (id.includes('valtio')) {
              return 'store';
            }
            // Firebase 관련
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // 기타 라이브러리들
            return 'vendor';
          }
          
          // 게임 단계별 컴포넌트들
          if (id.includes('src/components/') && (
            id.includes('TopicSelection') ||
            id.includes('RoleAssignment') ||
            id.includes('ExplanationPhase') ||
            id.includes('VotingPhase') ||
            id.includes('RevotePhase') ||
            id.includes('WithdrawalPhase') ||
            id.includes('GameResult')
          )) {
            return 'game-phases';
          }
          
          // 공통 컴포넌트들
          if (id.includes('src/components/') && (
            id.includes('Lobby') ||
            id.includes('Chat') ||
            id.includes('Modal') ||
            id.includes('PlayerCard') ||
            id.includes('Card') ||
            id.includes('Button')
          )) {
            return 'common-components';
          }
          
          // 유틸리티들
          if (id.includes('src/utils/') || id.includes('src/stores/') || id.includes('src/contexts/')) {
            return 'utils';
          }
        }
      }
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    // 소스맵 생성 (프로덕션에서는 비활성화)
    sourcemap: false,
    // CSS 코드 스플리팅
    cssCodeSplit: true
  }
})
