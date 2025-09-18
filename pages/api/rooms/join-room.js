import { getRoom, setRoom } from '../../../lib/redis'
import { createPlayer } from '../../../data/game-types'
import { GAME_CONFIG } from '../../../data/game-types'
import { validateRoomCode, validatePlayerName, validateRateLimit } from '../../../utils/validation'
import { validateEnvironmentVariables } from '../../../utils/env-validator'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 환경변수 검증
  const envValidation = validateEnvironmentVariables()
  if (!envValidation.isValid) {
    console.error('환경변수 설정 오류:', envValidation.missing)
    return res.status(500).json({ 
      error: '서버 설정 오류가 발생했습니다',
      details: '환경변수를 확인해주세요'
    })
  }

  try {
    const { roomCode, playerName } = req.body

    // Rate Limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const rateLimitResult = validateRateLimit(`join_${clientIP}`, 5, 60000)
    if (!rateLimitResult.valid) {
      return res.status(429).json({
        error: rateLimitResult.error,
        retryAfter: rateLimitResult.retryAfter
      })
    }

    // 입력 검증
    const roomCodeValidation = validateRoomCode(roomCode)
    if (!roomCodeValidation.valid) {
      return res.status(400).json({ error: roomCodeValidation.error })
    }

    const playerNameValidation = validatePlayerName(playerName)
    if (!playerNameValidation.valid) {
      return res.status(400).json({ error: playerNameValidation.error })
    }

    const trimmedRoomCode = roomCodeValidation.value
    const trimmedName = playerNameValidation.value

    // 방 조회
    const room = await getRoom(trimmedRoomCode)
    if (!room) {
      return res.status(404).json({
        error: '존재하지 않는 방입니다'
      })
    }

    // 최대 플레이어 수 체크
    if (room.players.length >= GAME_CONFIG.MAX_PLAYERS) {
      return res.status(400).json({
        error: '방이 가득 찼습니다'
      })
    }

    // 중복 이름 체크
    const existingPlayer = room.players.find(p => p.name === trimmedName)
    if (existingPlayer) {
      return res.status(400).json({
        error: '이미 사용 중인 이름입니다'
      })
    }

    // 플레이어 생성
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const player = createPlayer(
      `temp_socket_${Date.now()}`, // 임시 socketId
      sessionId,
      trimmedName,
      false // isHost
    )

    // 방에 플레이어 추가
    room.players.push(player)
    room.lastUpdatedAt = Date.now()

    // Redis에 저장
    await setRoom(room)

    res.status(200).json({
      success: true,
      message: '방에 성공적으로 참가했습니다',
      roomId: room.id,
      sessionId,
      playerName: trimmedName,
      isHost: false,
      currentPhase: room.phase,
      players: room.players.map(p => ({
        id: p.socketId,
        name: p.name,
        isHost: p.isHost
      }))
    })
  } catch (error) {
    console.error('방 참가 오류:', error)
    res.status(500).json({
      error: '방 참가 중 오류가 발생했습니다',
      details: error.message
    })
  }
}

function generatePlayerId() {
  return Math.random().toString(36).substr(2, 9)
}
