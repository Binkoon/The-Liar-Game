// 입력 검증 유틸리티
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // XSS 방지
    .substring(0, 100) // 길이 제한
}

export const validateRoomCode = (roomCode) => {
  if (!roomCode || typeof roomCode !== 'string') {
    return { valid: false, error: '방 코드가 필요합니다' }
  }
  
  const trimmed = roomCode.trim().toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
    return { valid: false, error: '방 코드는 6자리 영문자와 숫자여야 합니다' }
  }
  
  return { valid: true, value: trimmed }
}

export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '플레이어 이름이 필요합니다' }
  }
  
  const trimmed = sanitizeInput(name)
  if (trimmed.length < 2) {
    return { valid: false, error: '이름은 2글자 이상이어야 합니다' }
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: '이름은 20글자 이하여야 합니다' }
  }
  
  // 특수문자 제한
  if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmed)) {
    return { valid: false, error: '이름에는 한글, 영문, 숫자만 사용할 수 있습니다' }
  }
  
  return { valid: true, value: trimmed }
}

export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, error: '세션 ID가 필요합니다' }
  }
  
  if (!/^session_\d+_[a-z0-9]+$/.test(sessionId)) {
    return { valid: false, error: '유효하지 않은 세션 ID입니다' }
  }
  
  return { valid: true, value: sessionId }
}

// Rate Limiting
const rateLimitStore = new Map()

export const validateRateLimit = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // 기존 요청들 중 유효한 것만 필터링
  const requests = rateLimitStore.get(key) || []
  const validRequests = requests.filter(time => time > windowStart)
  
  if (validRequests.length >= maxRequests) {
    return { 
      valid: false, 
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    }
  }
  
  // 새 요청 추가
  validRequests.push(now)
  rateLimitStore.set(key, validRequests)
  
  return { valid: true }
}

// CSRF 토큰 생성 및 검증
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const verifyCSRFToken = (token, sessionToken) => {
  return token && sessionToken && token === sessionToken
}

export const validateSpeechContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: '발언 내용이 필요합니다' }
  }
  
  const trimmed = sanitizeInput(content)
  if (trimmed.length < 1) {
    return { valid: false, error: '발언 내용은 1글자 이상이어야 합니다' }
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: '발언 내용은 500글자 이하여야 합니다' }
  }
  
  // 부적절한 내용 필터링
  const inappropriateWords = ['욕설', '비속어', '혐오표현'] // 실제로는 더 구체적인 필터링 필요
  const hasInappropriate = inappropriateWords.some(word => trimmed.includes(word))
  
  if (hasInappropriate) {
    return { valid: false, error: '부적절한 내용이 포함되어 있습니다' }
  }
  
  return { valid: true, value: trimmed }
}