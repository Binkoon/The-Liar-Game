import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ThemeToggle from '../components/ui/ThemeToggle'

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

        <motion.div 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            📊 팀 빌딩 워크샵
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            협업 및 커뮤니케이션 향상을 위한 그룹 활동
          </motion.p>
          
          <motion.div 
            className="game-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/create-room">
                <Button variant="primary" size="large">
                  세션 생성
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/join-room">
                <Button variant="secondary" size="large">
                  세션 참가
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/how-to-play">
                <Button variant="ghost" size="large">
                  활동 가이드
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin">
                <Button variant="outline" size="large">
                  🔧 관리자 도구
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="game-info">
          <Card title="활동 개요">
            <div className="game-rules">
              <h3>🎯 목표</h3>
              <p>팀원 간의 커뮤니케이션과 협업 능력을 향상시키는 그룹 활동입니다.</p>
              
              <h3>👥 참여자 역할</h3>
              <ul>
                <li><strong>일반 참여자</strong>: 주제에 대한 지식을 공유하며 팀 협력을 도모합니다</li>
                <li><strong>관찰자</strong>: 정보를 분석하고 팀 내 의사소통을 평가합니다</li>
                <li><strong>조력자</strong>: 팀 전체의 성공을 위해 협력합니다</li>
              </ul>
              
              <h3>📋 진행 과정</h3>
              <ol>
                <li>참여자들이 주제에 대해 의견을 공유합니다</li>
                <li>팀 전체가 협업 과정을 평가하고 피드백을 제공합니다</li>
                <li>팀워크와 커뮤니케이션 능력이 향상되었는지 확인합니다</li>
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
          background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
          border-radius: var(--radius-2xl);
          margin: var(--space-8) 0;
          border: 1px solid var(--border-color);
        }

        .hero-section h1 {
          font-size: var(--font-size-5xl);
          color: var(--color-primary-700);
          margin-bottom: var(--space-4);
        }

        .hero-section p {
          font-size: var(--font-size-xl);
          color: var(--color-gray-600);
          margin-bottom: var(--space-8);
        }

        .game-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
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
