import { getRoom, setRoom } from '../../../lib/memory-store'
import { createPlayer } from '../../../data/game-types'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId, count = 1 } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' })
    }

    // 방 조회
    const room = await getRoom(roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // 최대 플레이어 수 체크
    if (room.players.length >= 8) {
      return res.status(400).json({ error: 'Room is full' })
    }

    const botNames = ['봇플레이어1', '봇플레이어2', '봇플레이어3', '봇플레이어4', '봇플레이어5']
    const addedBots = []

    // 봇 플레이어 추가
    for (let i = 0; i < count && room.players.length < 8; i++) {
      const botName = botNames[room.players.length - 1] || `봇플레이어${room.players.length}`
      const botPlayer = createPlayer(
        `bot_socket_${Date.now()}_${i}`, // socketId
        `bot_session_${Date.now()}_${i}`, // sessionId
        botName,
        false // isHost
      )
      
      // 봇 표시
      botPlayer.isBot = true
      
      room.players.push(botPlayer)
      addedBots.push({
        id: botPlayer.socketId,
        name: botPlayer.name,
        isHost: false,
        isBot: true
      })
    }

    room.lastUpdatedAt = Date.now()
    await setRoom(room)

    return res.status(200).json({
      success: true,
      addedBots,
      totalPlayers: room.players.length,
      message: `${addedBots.length}명의 봇 플레이어가 추가되었습니다.`
    })

  } catch (error) {
    console.error('봇 플레이어 추가 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
