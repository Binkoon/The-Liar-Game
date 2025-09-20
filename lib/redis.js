import Redis from 'ioredis'

// Redis Cloud 연결 설정
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: false, // Redis Cloud TLS 설정
    checkServerIdentity: () => undefined
  } : undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Vercel에서 지연 연결
  connectTimeout: 30000, // 30초 타임아웃
  commandTimeout: 10000, // 10초 명령 타임아웃
  family: 4, // IPv4 사용
  keepAlive: true,
  // Vercel 최적화
  maxRetriesPerRequest: 1,
  retryDelayOnFailover: 100,
})

// Redis 연결 상태 확인
redis.on('connect', () => {
  // Redis 연결 성공
})

redis.on('error', (err) => {
  // Redis 연결 오류
})

export default redis

// 방 생성 함수
export const createRoom = (roomCode) => {
  const room = {
    id: roomCode,
    code: roomCode,
    players: [],
    gameState: 'waiting',
    currentRound: 0,
    maxPlayers: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return room
}

// 방 데이터 조작 함수들
export const setRoom = async (room) => {
  try {
    await redis.set(`liarGame:room:${room.id}`, JSON.stringify(room))
  } catch (error) {
    throw error
  }
}

export const getRoom = async (roomId) => {
  try {
    const roomData = await redis.get(`liarGame:room:${roomId}`)
    
    if (!roomData) {
      return null
    }

    return JSON.parse(roomData)
  } catch (error) {
    return null
  }
}

export const deleteRoom = async (roomId) => {
  try {
    await redis.del(`liarGame:room:${roomId}`)
  } catch (error) {
    throw error
  }
}

// 방 목록 조회 (개발용)
export const getAllRooms = async () => {
  try {
    const keys = await redis.keys('liarGame:room:*')
    const rooms = []
    
    for (const key of keys) {
      const roomData = await redis.get(key)
      if (roomData) {
        rooms.push(JSON.parse(roomData))
      }
    }
    
    return rooms
  } catch (error) {
    return []
  }
}
