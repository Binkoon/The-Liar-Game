import { createRoom, setRoom } from '../../../lib/redis'
import { createPlayer } from '../../../data/game-types'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { playerName } = req.body

    // 입력 검증
    if (!playerName || !playerName.trim()) {
      return res.status(400).json({ 
        error: '플레이어 이름이 필요합니다' 
      })
    }

    const trimmedName = playerName.trim()
    if (trimmedName.length < 2) {
      return res.status(400).json({ 
        error: '이름은 2글자 이상 입력해주세요' 
      })
    }

    // 방 코드 생성
    const roomCode = generateRoomCode()
    
    // 방 생성
    const room = createRoom(roomCode)
    
    // 첫 번째 플레이어(호스트) 생성
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const hostPlayer = createPlayer(
      `temp_socket_${Date.now()}`, // 임시 socketId
      sessionId,
      trimmedName,
      true // isHost
    )
    
    room.players.push(hostPlayer)
    
    // Redis에 방 저장
    await setRoom(room)
    
    res.status(201).json({
      success: true,
      roomCode,
      roomId: room.id,
      sessionId,
      playerName: trimmedName,
      isHost: true,
      message: '방이 성공적으로 생성되었습니다'
    })
  } catch (error) {
    console.error('방 생성 오류:', error)
    res.status(500).json({
      error: '방 생성 중 오류가 발생했습니다',
      details: error.message
    })
  }
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
