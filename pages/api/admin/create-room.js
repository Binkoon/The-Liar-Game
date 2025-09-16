import { getRoom, setRoom } from '../../../lib/redis'
import { createRoom } from '../../../data/game-types'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId } = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' })
    }

    // 방 ID 중복 체크
    const existingRoom = await getRoom(roomId)
    if (existingRoom) {
      return res.status(400).json({ error: 'Room ID already exists' })
    }

    // 새 방 생성
    const newRoom = createRoom(roomId)
    
    await setRoom(newRoom)

    return res.status(200).json({
      success: true,
      message: `테스트 방 '${roomId}' 생성 완료`,
      room: newRoom
    })

  } catch (error) {
    console.error('테스트 방 생성 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
