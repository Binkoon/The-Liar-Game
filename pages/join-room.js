import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function JoinRoom() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const handleJoinRoom = async () => {
    const trimmedRoomCode = roomCode.trim().toUpperCase()
    const trimmedName = playerName.trim()
    
    if (!trimmedRoomCode) {
      setError('방 코드를 입력해주세요.')
      return
    }

    if (!trimmedName) {
      setError('이름을 입력해주세요.')
      return
    }

    if (trimmedName.length < 2) {
      setError('이름은 2글자 이상 입력해주세요.')
      return
    }

    if (trimmedRoomCode.length !== 6) {
      setError('방 코드는 6자리여야 합니다.')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      // 세션 ID 생성
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 방 참가 페이지로 이동
      router.push({
        pathname: `/room/${trimmedRoomCode}`,
        query: {
          playerName: trimmedName,
          sessionId: sessionId,
          isHost: false
        }
      })

    } catch (error) {
      setError('방 참가 중 오류가 발생했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateNew = () => {
    router.push('/create-room')
  }

  return (
    <>
      <Head>
        <title>방 참가하기 - 라이어 게임</title>
        <meta name="description" content="방 코드를 입력하여 라이어 게임에 참가하세요" />
      </Head>

      <div className="container">
        <div className="join-room-page">
          <Card title="방 참가하기" className="join-room-card">
            <div className="join-room-content">
              <p className="description">
                호스트에게 받은 방 코드를 입력하여 게임에 참가하세요!
              </p>

              <div className="input-section">
                <Input
                  label="방 코드"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="6자리 방 코드 입력"
                  maxLength={6}
                  required
                  error={error.includes('방 코드') ? error : ''}
                />

                <Input
                  label="플레이어 이름"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={10}
                  required
                  error={error.includes('이름') ? error : ''}
                />
              </div>

              <div className="button-section">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode.trim() || !playerName.trim()}
                  className="join-button"
                >
                  {isJoining ? '참가 중...' : '방 참가하기'}
                </Button>

                <Button
                  variant="ghost"
                  size="large"
                  onClick={handleCreateNew}
                  className="create-button"
                >
                  새 방 만들기
                </Button>
              </div>

              <div className="help-section">
                <h3>방 코드를 모르시나요?</h3>
                <p>
                  호스트가 생성한 6자리 방 코드를 입력해주세요. 
                  방 코드는 대문자와 숫자로 구성됩니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .join-room-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: var(--space-8) 0;
        }

        .join-room-card {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .join-room-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .description {
          font-size: var(--font-size-lg);
          color: var(--color-gray-600);
          text-align: center;
          margin: 0;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .button-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .join-button {
          width: 100%;
        }

        .create-button {
          width: 100%;
        }

        .help-section {
          background: var(--color-primary-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-primary-200);
        }

        .help-section h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-lg);
          color: var(--color-primary-700);
        }

        .help-section p {
          margin: 0;
          color: var(--color-primary-600);
          line-height: var(--line-height-relaxed);
        }

        @media (max-width: 640px) {
          .join-room-page {
            padding: var(--space-4) 0;
          }
          
          .join-room-card {
            margin: 0 var(--space-4);
          }
        }
      `}</style>
    </>
  )
}
