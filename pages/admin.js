import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function AdminPanel() {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomDetails, setRoomDetails] = useState(null)
  const [newRoomId, setNewRoomId] = useState('')
  const [testPlayerName, setTestPlayerName] = useState('테스트플레이어')

  // 방 목록 조회
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms')
      const data = await response.json()
      setRooms(data.rooms || [])
    } catch (error) {
      console.error('방 목록 조회 오류:', error)
    }
  }

  // 방 상세 정보 조회
  const fetchRoomDetails = async (roomId) => {
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`)
      const data = await response.json()
      setRoomDetails(data.room)
      setSelectedRoom(roomId)
    } catch (error) {
      console.error('방 상세 정보 조회 오류:', error)
    }
  }

  // 테스트 플레이어 추가
  const addTestPlayer = async () => {
    if (!selectedRoom || !testPlayerName) return

    try {
      const response = await fetch('/api/admin/add-test-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          playerName: testPlayerName
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRoomDetails(selectedRoom)
        setTestPlayerName('테스트플레이어' + Math.floor(Math.random() * 100))
      }
    } catch (error) {
      console.error('테스트 플레이어 추가 오류:', error)
    }
  }

  // 게임 단계 강제 변경
  const forceNextPhase = async () => {
    if (!selectedRoom) return

    try {
      const response = await fetch('/api/admin/force-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          action: 'next'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRoomDetails(selectedRoom)
      }
    } catch (error) {
      console.error('게임 단계 변경 오류:', error)
    }
  }

  // 게임 재시작
  const resetGame = async () => {
    if (!selectedRoom) return

    try {
      const response = await fetch('/api/admin/reset-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRoomDetails(selectedRoom)
      }
    } catch (error) {
      console.error('게임 재시작 오류:', error)
    }
  }

  // 방 생성
  const createTestRoom = async () => {
    if (!newRoomId) return

    try {
      const response = await fetch('/api/admin/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: newRoomId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRooms()
        setNewRoomId('')
      }
    } catch (error) {
      console.error('테스트 방 생성 오류:', error)
    }
  }

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 5000) // 5초마다 새로고침
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-panel"
      >
        <div className="admin-header">
          <h1>🎮 관리자 패널</h1>
          <p>게임 상태 모니터링 및 테스트 도구</p>
        </div>

        <div className="admin-content">
          {/* 방 목록 */}
          <Card className="admin-section">
            <div className="card-header">
              <h3>활성 방 목록</h3>
              <Button onClick={fetchRooms} size="small">새로고침</Button>
            </div>
            <div className="card-content">
              <div className="room-list">
                {rooms.map(room => (
                  <div 
                    key={room.id}
                    className={`room-item ${selectedRoom === room.id ? 'selected' : ''}`}
                    onClick={() => fetchRoomDetails(room.id)}
                  >
                    <div className="room-info">
                      <strong>방 ID: {room.id}</strong>
                      <span>플레이어: {room.players.length}명</span>
                      <span>상태: {room.phase}</span>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="no-rooms">활성 방이 없습니다.</p>
                )}
              </div>
            </div>
          </Card>

          {/* 테스트 방 생성 */}
          <Card className="admin-section">
            <div className="card-header">
              <h3>테스트 방 생성</h3>
            </div>
            <div className="card-content">
              <div className="create-room-form">
                <Input
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  placeholder="방 ID 입력"
                  className="room-id-input"
                />
                <Button onClick={createTestRoom} disabled={!newRoomId}>
                  테스트 방 생성
                </Button>
              </div>
            </div>
          </Card>

          {/* 선택된 방 관리 */}
          {selectedRoom && roomDetails && (
            <Card className="admin-section">
              <div className="card-header">
                <h3>방 관리: {selectedRoom}</h3>
                <Button onClick={() => fetchRoomDetails(selectedRoom)} size="small">
                  새로고침
                </Button>
              </div>
              <div className="card-content">
                <div className="room-details">
                  <div className="room-status">
                    <p><strong>현재 단계:</strong> {roomDetails.phase}</p>
                    <p><strong>플레이어 수:</strong> {roomDetails.players.length}명</p>
                    <p><strong>주제:</strong> {roomDetails.subject || '미선택'}</p>
                    <p><strong>키워드:</strong> {roomDetails.keyword || '미선택'}</p>
                    <p><strong>라이어:</strong> {roomDetails.liar?.name || '미배정'}</p>
                  </div>

                  <div className="player-list">
                    <h4>플레이어 목록</h4>
                    {roomDetails.players.map((player, index) => (
                      <div key={player.socketId} className="player-item">
                        <span>{player.name}</span>
                        <span className="player-role">{player.role || '미배정'}</span>
                        {player.isHost && <span className="host-badge">👑</span>}
                        {player.isBot && <span className="bot-badge">🤖</span>}
                      </div>
                    ))}
                  </div>

                  <div className="admin-controls">
                    <h4>관리자 제어</h4>
                    <div className="control-buttons">
                      <Button onClick={forceNextPhase} variant="primary">
                        다음 단계로
                      </Button>
                      <Button onClick={resetGame} variant="secondary">
                        게임 재시작
                      </Button>
                    </div>
                  </div>

                  <div className="test-player-section">
                    <h4>테스트 플레이어 추가</h4>
                    <div className="test-player-form">
                      <Input
                        value={testPlayerName}
                        onChange={(e) => setTestPlayerName(e.target.value)}
                        placeholder="플레이어 이름"
                      />
                      <Button onClick={addTestPlayer} variant="success">
                        테스트 플레이어 추가
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 게임 링크 */}
          {selectedRoom && (
            <Card className="admin-section">
              <div className="card-header">
                <h3>게임 링크</h3>
              </div>
              <div className="card-content">
                <div className="game-link">
                  <Input
                    value={`http://localhost:3000/room/${selectedRoom}`}
                    readOnly
                    className="link-input"
                  />
                  <Button 
                    onClick={() => window.open(`/room/${selectedRoom}`, '_blank')}
                    variant="primary"
                  >
                    게임 열기
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .admin-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          color: var(--color-primary-700);
          margin-bottom: 0.5rem;
        }

        .admin-content {
          display: grid;
          gap: 1.5rem;
        }

        .admin-section {
          margin-bottom: 1rem;
        }

        .room-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .room-item {
          padding: 1rem;
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .room-item:hover {
          background-color: var(--color-gray-50);
          border-color: var(--color-primary-300);
        }

        .room-item.selected {
          background-color: var(--color-primary-50);
          border-color: var(--color-primary-500);
        }

        .room-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .room-info span {
          color: var(--color-gray-600);
          font-size: 0.9rem;
        }

        .no-rooms {
          text-align: center;
          color: var(--color-gray-500);
          font-style: italic;
        }

        .create-room-form {
          display: flex;
          gap: 1rem;
          align-items: end;
        }

        .room-id-input {
          flex: 1;
        }

        .room-details {
          display: grid;
          gap: 1.5rem;
        }

        .room-status {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          padding: 1rem;
          background-color: var(--color-gray-50);
          border-radius: var(--radius-md);
        }

        .player-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .player-item {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 0.5rem;
          background-color: var(--color-gray-50);
          border-radius: var(--radius-sm);
        }

        .player-role {
          color: var(--color-primary-600);
          font-weight: 500;
        }

        .host-badge, .bot-badge {
          font-size: 1.2rem;
        }

        .admin-controls {
          padding: 1rem;
          background-color: var(--color-warning-50);
          border-radius: var(--radius-md);
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .test-player-section {
          padding: 1rem;
          background-color: var(--color-success-50);
          border-radius: var(--radius-md);
        }

        .test-player-form {
          display: flex;
          gap: 1rem;
          align-items: end;
          margin-top: 1rem;
        }

        .game-link {
          display: flex;
          gap: 1rem;
          align-items: end;
        }

        .link-input {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}
