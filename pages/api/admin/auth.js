// 관리자 인증 미들웨어
export function requireAdminAuth(req, res, next) {
  const adminToken = req.headers.authorization?.replace('Bearer ', '')
  const validToken = process.env.ADMIN_TOKEN
  
  if (!validToken) {
    return res.status(500).json({ 
      error: '서버 설정 오류: 관리자 토큰이 설정되지 않았습니다',
      code: 'SERVER_ERROR'
    })
  }
  
  if (!adminToken || adminToken !== validToken) {
    return res.status(401).json({ 
      error: '관리자 권한이 필요합니다',
      code: 'UNAUTHORIZED'
    })
  }
  
  // 인증 성공 시 다음 미들웨어 실행
  if (typeof next === 'function') {
    next()
  }
}

// 관리자 토큰 생성
export function generateAdminToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
