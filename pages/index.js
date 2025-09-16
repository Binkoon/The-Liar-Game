import React, { Suspense } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 컴포넌트 레이지 로딩
const Button = dynamic(() => import('../components/ui/Button'), {
  loading: () => <div className="loading-skeleton">버튼 로딩 중...</div>
})

const Card = dynamic(() => import('../components/ui/Card'), {
  loading: () => <div className="loading-skeleton">카드 로딩 중...</div>
})

const ThemeToggle = dynamic(() => import('../components/ui/ThemeToggle'), {
  loading: () => <div className="loading-skeleton">테마 토글 로딩 중...</div>
})

// Framer Motion은 SSR 비활성화로 동적 임포트
const HeroSection = dynamic(() => import('../components/layout/HeroSection'), {
  ssr: false,
  loading: () => <div className="loading">로딩 중...</div>
})


export default function Home() {
  return (
    <>
      <Head>
        <title>라이어 게임</title>
        <meta name="description" content="온라인 라이어 게임 - 친구들과 함께 즐기는 추리 게임" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {/* 테마 토글 버튼 */}
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>

        <Suspense fallback={<div className="loading">로딩 중...</div>}>
          <HeroSection />
        </Suspense>

        <div className="game-info">
          <Card title="게임 소개">
            <div className="game-rules">
              <h3>🎯 게임 목표</h3>
              <p>한 명의 라이어를 찾아내거나, 라이어가 모든 라운드를 통과하는 것이 목표입니다.</p>
              
              <h3>👥 역할 설명</h3>
              <ul>
                <li><strong>일반인</strong>: 주제와 키워드를 알고 있어 라이어를 찾아내야 합니다</li>
                <li><strong>라이어</strong>: 주제는 알지만 키워드를 모르므로 정체를 숨겨야 합니다</li>
                <li><strong>광신도</strong>: 라이어를 도와야 하는 특별한 역할입니다 (5명 이상)</li>
              </ul>
              
              <h3>📋 게임 진행</h3>
              <ol>
                <li>모든 플레이어가 주제에 대해 설명합니다</li>
                <li>라이어로 의심되는 사람에게 투표합니다</li>
                <li>가장 많은 표를 받은 플레이어가 제외됩니다</li>
                <li>라이어를 찾으면 일반인 승리, 모든 라운드를 통과하면 라이어 승리!</li>
              </ol>
          </div>
        </Card>
      </div>
    </div>

    <style jsx>{`
        .theme-toggle-container {
          display: flex;
          justify-content: flex-end;
          padding: var(--space-4) 0;
        }

        .hero-section {
          text-align: center;
          padding: var(--space-16) 0;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(14, 165, 233, 0.1) 50%, rgba(0, 255, 136, 0.05) 100%);
          border-radius: var(--radius-2xl);
          margin: var(--space-8) 0;
          border: 2px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 25px 50px rgba(168, 85, 247, 0.1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: gameShimmer 3s infinite;
        }

        .hero-section h1 {
          font-size: var(--font-size-5xl);
          color: var(--color-primary-700);
          margin-bottom: var(--space-4);
          text-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          position: relative;
          z-index: 1;
        }

        .hero-section p {
          font-size: var(--font-size-xl);
          color: var(--color-primary-600);
          margin-bottom: var(--space-8);
          position: relative;
          z-index: 1;
        }

        .game-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
          justify-content: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .game-info {
          margin: var(--space-8) 0;
        }

        .game-rules {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .game-rules h3 {
          color: var(--color-primary-600);
          font-size: var(--font-size-lg);
        }

        .game-rules ul, .game-rules ol {
          padding-left: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .game-rules li {
          line-height: var(--line-height-relaxed);
        }

        @media (max-width: 640px) {
          .hero-section {
            padding: var(--space-12) 0;
          }
          
          .hero-section h1 {
            font-size: var(--font-size-4xl);
          }
          
          .game-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  )
}
