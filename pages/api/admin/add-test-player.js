import { getRoom, setRoom } from '../../../lib/redis'
import { createPlayer } from '../../../data/game-types'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId, playerName } = req.body

    if (!roomId || !playerName) {
      return res.status(400).json({ error: 'Room ID and player name are required' })
    }

    const room = await getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // 최대 플레이어 수 체크
    if (room.players.length >= 8) {
      return res.status(400).json({ error: 'Room is full' })
    }

    // 중복 이름 체크
    if (room.players.some(p => p.name === playerName)) {
      return res.status(400).json({ error: 'Player name already exists' })
    }

    // 테스트 플레이어 생성
    const testPlayer = createPlayer(
      `test_socket_${Date.now()}`,
      `test_session_${Date.now()}`,
      playerName,
      false
    )

    // 테스트 플레이어 표시
    testPlayer.isTestPlayer = true
    
    room.players.push(testPlayer)
    room.lastUpdatedAt = Date.now()
    
    await setRoom(room)

    return res.status(200).json({
      success: true,
      message: `테스트 플레이어 '${playerName}' 추가 완료`,
      player: {
        id: testPlayer.socketId,
        name: testPlayer.name,
        isTestPlayer: true
      },
      totalPlayers: room.players.length
    })

  } catch (error) {
    console.error('테스트 플레이어 추가 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
