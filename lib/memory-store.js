// Redis 대신 메모리를 사용하는 임시 저장소
class MemoryStore {
  constructor() {
    this.rooms = new Map()
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredRooms()
    }, 60000) // 1분마다 정리
  }

  // 방 저장
  async setRoom(room) {
    this.rooms.set(room.id, {
      ...room,
      lastAccessed: Date.now()
    })
  }

  // 방 조회
  async getRoom(roomId) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.lastAccessed = Date.now()
      return room
    }
    return null
  }

  // 방 삭제
  async deleteRoom(roomId) {
    this.rooms.delete(roomId)
    console.log(`방 ${roomId} 메모리에서 삭제됨`)
  }

  // 모든 방 조회 (개발용)
  async getAllRooms() {
    return Array.from(this.rooms.values())
  }

  // 만료된 방 정리 (1시간 이상 접근하지 않은 방)
  cleanupExpiredRooms() {
    const now = Date.now()
    const expiredRooms = []
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastAccessed > 3600000) { // 1시간
        expiredRooms.push(roomId)
      }
    }
    
    expiredRooms.forEach(roomId => {
      this.rooms.delete(roomId)
      console.log(`만료된 방 ${roomId} 정리됨`)
    })
    
    if (expiredRooms.length > 0) {
      console.log(`${expiredRooms.length}개 방이 정리되었습니다.`)
    }
  }

  // 저장소 종료
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.rooms.clear()
  }
}

// 싱글톤 인스턴스
const memoryStore = new MemoryStore()

export default memoryStore

// Redis와 동일한 인터페이스 제공
export const setRoom = async (room) => {
  return memoryStore.setRoom(room)
}

export const getRoom = async (roomId) => {
  return memoryStore.getRoom(roomId)
}

export const deleteRoom = async (roomId) => {
  return memoryStore.deleteRoom(roomId)
}

export const getAllRooms = async () => {
  return memoryStore.getAllRooms()
}
