import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function HeroSection() {
  return (
    <motion.div
      className="hero-section"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 1.4, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.1
      }}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 1.0, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.3
        }}
      >
        🎭 라이어 게임
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.9, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.5
        }}
      >
        친구들과 함께 즐기는 온라인 추리 게임
      </motion.p>
      
      <motion.div 
        className="game-actions"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.1, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.7
        }}
      >
        <motion.div
          whileHover={{ 
            scale: 1.08, 
            y: -2,
            transition: { 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          whileTap={{ 
            scale: 0.96,
            transition: { 
              duration: 0.15, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.9
          }}
        >
              <Link href="/create-room">
                <Button variant="primary" size="large">
                  방 만들기
                </Button>
              </Link>
            </motion.div>
            
        <motion.div
          whileHover={{ 
            scale: 1.08, 
            y: -2,
            transition: { 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          whileTap={{ 
            scale: 0.96,
            transition: { 
              duration: 0.15, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 1.0
          }}
        >
          <Link href="/join-room">
            <Button variant="secondary" size="large">
              방 참가하기
            </Button>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ 
            scale: 1.08, 
            y: -2,
            transition: { 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          whileTap={{ 
            scale: 0.96,
            transition: { 
              duration: 0.15, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 1.1
          }}
        >
          <Link href="/how-to-play">
            <Button variant="ghost" size="large">
              게임 방법
            </Button>
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ 
            scale: 1.08, 
            y: -2,
            transition: { 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          whileTap={{ 
            scale: 0.96,
            transition: { 
              duration: 0.15, 
              ease: [0.25, 0.1, 0.25, 1] 
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 1.2
          }}
        >
          <Link href="/admin">
            <Button variant="outline" size="large">
              🔧 관리자 도구
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
