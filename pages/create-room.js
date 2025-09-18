import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function CreateRoom() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  // 클라이언트에서는 방 코드 생성하지 않음
  // 서버에서 생성된 방 코드를 받아서 사용

  const handleCreateRoom = async () => {
    const trimmedName = playerName.trim()
    
    if (!trimmedName) {
      setError('이름을 입력해주세요.')
      return
    }

    if (trimmedName.length < 2) {
      setError('이름은 2글자 이상 입력해주세요.')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // API를 통한 방 생성
      const response = await fetch('/api/rooms/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: trimmedName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '방 생성에 실패했습니다.')
      }

      // 서버에서 생성된 데이터로 게임 방으로 이동
      router.push({
        pathname: `/room/${data.roomId}`,
        query: {
          playerName: data.playerName,
          sessionId: data.sessionId,
          isHost: data.isHost
        }
      })

    } catch (error) {
      console.error('방 생성 오류:', error)
      setError(error.message || '방 생성 중 오류가 발생했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinExisting = () => {
    router.push('/join-room')
  }

  return (
    <>
      <Head>
        <title>방 만들기 - 라이어 게임</title>
        <meta name="description" content="새로운 라이어 게임 방을 만들고 친구들을 초대하세요" />
      </Head>

      <div className="container">
        <div className="create-room-page">
          <Card title="방 만들기" className="create-room-card">
            <div className="create-room-content">
              <p className="description">
                새로운 게임 방을 만들고 친구들을 초대하세요!
              </p>

              <div className="input-section">
                <Input
                  label="플레이어 이름"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={10}
                  required
                  error={error}
                />
              </div>

              <div className="button-section">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleCreateRoom}
                  disabled={isCreating || !playerName.trim()}
                  className="create-button"
                >
                  {isCreating ? '방 생성 중...' : '방 만들기'}
                </Button>

                <Button
                  variant="ghost"
                  size="large"
                  onClick={handleJoinExisting}
                  className="join-button"
                >
                  기존 방 참가하기
                </Button>
              </div>

              <div className="game-info">
                <h3>게임 정보</h3>
                <ul>
                  <li>최소 3명, 최대 8명까지 참가 가능</li>
                  <li>첫 번째 플레이어가 호스트가 됩니다</li>
                  <li>호스트가 게임을 시작할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .create-room-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: var(--space-8) 0;
        }

        .create-room-card {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .create-room-content {
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

        .create-button {
          width: 100%;
        }

        .join-button {
          width: 100%;
        }

        .game-info {
          background: var(--color-gray-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-200);
        }

        .game-info h3 {
          margin: 0 0 var(--space-3) 0;
          font-size: var(--font-size-lg);
          color: var(--color-primary-600);
        }

        .game-info ul {
          margin: 0;
          padding-left: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .game-info li {
          color: var(--color-gray-600);
          line-height: var(--line-height-relaxed);
        }

        @media (max-width: 640px) {
          .create-room-page {
            padding: var(--space-4) 0;
          }
          
          .create-room-card {
            margin: 0 var(--space-4);
          }
        }
      `}</style>
    </>
  )
}
