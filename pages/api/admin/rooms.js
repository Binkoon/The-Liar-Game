import { getAllRooms } from '../../../lib/redis'
import { requireAdminAuth } from './auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 관리자 인증 확인
  requireAdminAuth(req, res, async () => {

    try {
      const rooms = await getAllRooms()
      
      // 방 정보를 간단하게 정리 (민감한 정보 제거)
      const roomList = rooms.map(room => ({
        id: room.id,
        phase: room.phase,
        players: room.players.map(p => ({
          name: p.name,
          role: p.role ? '[HIDDEN]' : null, // 역할 정보 숨김
          isHost: p.isHost,
          isBot: p.isBot || false
        })),
        subject: room.subject ? '[HIDDEN]' : null, // 주제 숨김
        keyword: room.keyword ? '[HIDDEN]' : null, // 키워드 숨김
        liar: room.liar ? '[HIDDEN]' : null, // 라이어 정보 숨김
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
  })
}
