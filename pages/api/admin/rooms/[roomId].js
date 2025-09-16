import { getRoom } from '../../../../lib/redis'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomId } = req.query

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' })
    }

    const room = await getRoom(roomId)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    return res.status(200).json({
      success: true,
      room: room
    })

  } catch (error) {
    console.error('방 상세 정보 조회 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
