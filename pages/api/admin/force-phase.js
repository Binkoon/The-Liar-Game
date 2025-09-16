import { getRoom, setRoom } from '../../../lib/redis'
import { GAME_PHASES } from '../../../data/game-types'
import { assignRoles } from '../../../data/game-rules'
import { getRandomKeyword } from '../../../data/keywords'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId, action } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' })
    }

    const room = await getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    if (action === 'next') {
      // 다음 단계로 강제 진행
      if (room.phase === GAME_PHASES.WAITING) {
        // 게임 시작
        if (room.players.length < 2) {
          return res.status(400).json({ error: '최소 2명의 플레이어가 필요합니다' })
        }

        // 역할 배정
        const roles = assignRoles(room.players.length)
        room.players.forEach((player, index) => {
          player.role = roles[`player_${index}`]
        })

        // 라이어 선택
        const liarIndex = room.players.findIndex(p => p.role === 'liar')
        if (liarIndex !== -1) {
          room.liar = {
            sessionId: room.players[liarIndex].sessionId,
            name: room.players[liarIndex].name
          }
        }

        // 주제와 키워드 선택
        const subjects = Object.keys(require('../../../data/keywords').keywords)
        const subject = subjects[Math.floor(Math.random() * subjects.length)]
        const keyword = getRandomKeyword(subject)

        room.subject = subject
        room.keyword = keyword
        room.phase = GAME_PHASES.PLAYING

      } else if (room.phase === GAME_PHASES.PLAYING) {
        // 투표 단계로
        room.currentPhase = 'voting'

      } else if (room.phase === GAME_PHASES.ENDED) {
        // 게임 재시작
        room.phase = GAME_PHASES.WAITING
        room.liar = null
        room.subject = null
        room.keyword = null
        room.votes = {}
        room.currentSpeakerIndex = 0
        room.round = 1
        
        // 플레이어 상태 초기화
        room.players.forEach(player => {
          player.hasSpoken = false
          player.isDead = false
          player.role = null
        })
      }

      room.lastUpdatedAt = Date.now()
      await setRoom(room)

      return res.status(200).json({
        success: true,
        message: `게임 단계가 ${room.phase}로 변경되었습니다`,
        newPhase: room.phase,
        room: room
      })
    }

    return res.status(400).json({ error: 'Invalid action' })

  } catch (error) {
    console.error('게임 단계 강제 변경 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
