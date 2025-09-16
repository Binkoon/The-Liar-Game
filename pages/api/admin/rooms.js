import { getAllRooms } from '../../../lib/redis'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rooms = await getAllRooms()
    
    // 방 정보를 간단하게 정리
    const roomList = rooms.map(room => ({
      id: room.id,
      phase: room.phase,
      players: room.players.map(p => ({
        name: p.name,
        role: p.role,
        isHost: p.isHost,
        isBot: p.isBot || false
      })),
      subject: room.subject,
      keyword: room.keyword,
      liar: room.liar,
      createdAt: room.createdAt,
      lastUpdatedAt: room.lastUpdatedAt
    }))

    return res.status(200).json({
      success: true,
      rooms: roomList,
      count: roomList.length
    })

  } catch (error) {
    console.error('방 목록 조회 오류:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
