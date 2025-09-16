export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomCode, playerName } = req.body

    if (!roomCode || !playerName) {
      return res.status(400).json({
        error: '방 코드와 플레이어 이름이 필요합니다'
      })
    }

    // TODO: 실제 방 참가 로직 구현
    // 1. 방 코드 유효성 검사
    // 2. 플레이어 추가
    // 3. 게임 상태 반환

    res.status(200).json({
      success: true,
      message: '방에 성공적으로 참가했습니다',
      player: {
        id: generatePlayerId(),
        name: playerName,
        roomCode
      }
    })
  } catch (error) {
    res.status(500).json({
      error: '방 참가 중 오류가 발생했습니다',
      details: error.message
    })
  }
}

function generatePlayerId() {
  return Math.random().toString(36).substr(2, 9)
}
