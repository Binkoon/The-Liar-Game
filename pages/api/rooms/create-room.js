export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // TODO: 실제 방 생성 로직 구현
    const roomCode = generateRoomCode()
    
    res.status(201).json({
      success: true,
      roomCode,
      message: '방이 성공적으로 생성되었습니다'
    })
  } catch (error) {
    res.status(500).json({
      error: '방 생성 중 오류가 발생했습니다',
      details: error.message
    })
  }
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
