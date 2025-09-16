import { setRoom, getRoom, getAllRooms, deleteRoom } from '../../../lib/memory-store'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 테스트 방 생성
    const testRoom = {
      id: 'TEST123',
      players: [],
      phase: 'waiting',
      createdAt: Date.now(),
      lastUpdatedAt: Date.now()
    }

    // 방 저장 테스트
    await setRoom(testRoom)
    
    // 방 조회 테스트
    const retrievedRoom = await getRoom('TEST123')
    
    if (retrievedRoom && retrievedRoom.id === 'TEST123') {
      // 모든 방 조회 테스트
      const allRooms = await getAllRooms()
      
      // 테스트 방 삭제
      await deleteRoom('TEST123')
      
      return res.status(200).json({
        status: 'success',
        message: '메모리 저장소 테스트 성공',
        tests: {
          save: true,
          retrieve: true,
          list: true,
          delete: true
        },
        roomCount: allRooms.length,
        timestamp: new Date().toISOString()
      })
    } else {
      throw new Error('방 조회 테스트 실패')
    }
    
  } catch (error) {
    console.error('메모리 저장소 테스트 오류:', error)
    
    return res.status(500).json({
      status: 'error',
      message: '메모리 저장소 테스트 실패',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
