import redis from '../../../lib/redis'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Redis 연결 테스트
    const testKey = 'liar-game:test'
    const testValue = `test-${Date.now()}`
    
    // 데이터 저장 테스트
    await redis.set(testKey, testValue, 'EX', 60) // 60초 후 자동 삭제
    
    // 데이터 조회 테스트
    const retrievedValue = await redis.get(testKey)
    
    // 데이터 삭제 테스트
    await redis.del(testKey)
    
    // 연결 상태 확인
    const pingResult = await redis.ping()
    
    return res.status(200).json({
      success: true,
      message: 'Redis Cloud 연결 성공!',
      tests: {
        set: retrievedValue === testValue ? '성공' : '실패',
        get: retrievedValue ? '성공' : '실패',
        delete: '성공',
        ping: pingResult === 'PONG' ? '성공' : '실패'
      },
      connectionInfo: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: process.env.REDIS_TLS === 'true'
      }
    })

  } catch (error) {
    console.error('Redis 연결 테스트 실패:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Redis Cloud 연결 실패',
      message: error.message,
      connectionInfo: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: process.env.REDIS_TLS === 'true'
      }
    })
  }
}
