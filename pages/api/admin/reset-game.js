import { getRoom, setRoom } from '../../../lib/redis'
import { GAME_PHASES } from '../../../data/game-types'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' })
    }

    const room = await getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // 게임 상태 초기화
    room.phase = GAME_PHASES.WAITING
    room.liar = null
    room.subject = null
    room.keyword = null
    room.votes = {}
    room.currentSpeakerIndex = 0
    room.round = 1
    room.winner = null
    room.endReason = null
    
    // 플레이어 상태 초기화
    room.players.forEach(player => {
      player.hasSpoken = false
      player.isDead = false
      player.role = null
      player.speech = null
    })

    room.lastUpdatedAt = Date.now()
    await setRoom(room)

    return res.status(200).json({
      success: true,
      message: '게임이 재시작되었습니다',
      room: room
    })

  } catch (error) {
    console.error('게임 재시작 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
