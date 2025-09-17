// 입력 검증 유틸리티
import { GameError, ERROR_TYPES, ERROR_MESSAGES } from './error-handler'

// 플레이어 이름 검증
export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].INVALID_NAME,
      'high'
    )
  }

  const trimmedName = name.trim()

  if (trimmedName.length === 0) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].NAME_TOO_SHORT,
      'high'
    )
  }

  if (trimmedName.length > 20) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].NAME_TOO_LONG,
      'high'
    )
  }

  // 한글, 영문, 숫자, 공백만 허용
  if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmedName)) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '이름은 한글, 영문, 숫자, 공백만 사용 가능합니다.',
      'high'
    )
  }

  // 연속된 공백 제거
  return trimmedName.replace(/\s+/g, ' ')
}

// 방 코드 검증
export const validateRoomCode = (roomCode) => {
  if (!roomCode || typeof roomCode !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].INVALID_ROOM_CODE,
      'high'
    )
  }

  const trimmedCode = roomCode.trim().toUpperCase()

  // 6자리 영문+숫자 조합
  if (!/^[A-Z0-9]{6}$/.test(trimmedCode)) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '방 코드는 6자리 영문+숫자 조합이어야 합니다.',
      'high'
    )
  }

  return trimmedCode
}

// 설명 내용 검증
export const validateSpeechContent = (content) => {
  if (!content || typeof content !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '설명을 입력해주세요.',
      'medium'
    )
  }

  const trimmedContent = content.trim()

  if (trimmedContent.length === 0) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '설명을 입력해주세요.',
      'medium'
    )
  }

  if (trimmedContent.length > 200) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '설명은 200자 이하로 입력해주세요.',
      'medium'
    )
  }

  // XSS 방지를 위한 기본적인 HTML 태그 제거
  const sanitizedContent = trimmedContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()

  return sanitizedContent
}

// 세션 ID 검증
export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '유효하지 않은 세션입니다.',
      'high'
    )
  }

  // UUID v4 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(sessionId)) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '유효하지 않은 세션 형식입니다.',
      'high'
    )
  }

  return sessionId
}

// Socket ID 검증
export const validateSocketId = (socketId) => {
  if (!socketId || typeof socketId !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '유효하지 않은 소켓 ID입니다.',
      'high'
    )
  }

  // Socket.io ID 형식 검증 (일반적으로 20자리 영문+숫자)
  if (!/^[a-zA-Z0-9]{20}$/.test(socketId)) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '유효하지 않은 소켓 ID 형식입니다.',
      'high'
    )
  }

  return socketId
}

// 게임 데이터 검증
export const validateGameData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].INVALID_INPUT,
      'high'
    )
  }

  // 필수 필드 검증
  const requiredFields = ['roomId', 'playerName', 'sessionId']
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new GameError(
        ERROR_TYPES.VALIDATION,
        `${field}는 필수 입력 항목입니다.`,
        'high'
      )
    }
  }

  return {
    roomId: validateRoomCode(data.roomId),
    playerName: validatePlayerName(data.playerName),
    sessionId: validateSessionId(data.sessionId)
  }
}

// 투표 데이터 검증
export const validateVoteData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      ERROR_MESSAGES[ERROR_TYPES.VALIDATION].INVALID_INPUT,
      'high'
    )
  }

  if (!data.targetPlayerId || typeof data.targetPlayerId !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '투표 대상 플레이어를 선택해주세요.',
      'high'
    )
  }

  return {
    targetPlayerId: validateSocketId(data.targetPlayerId)
  }
}

// Rate Limiting을 위한 간단한 검증
export const validateRateLimit = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now()
  const windowStart = now - windowMs

  // 메모리 기반 간단한 Rate Limiting (실제로는 Redis 사용 권장)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map()
  }

  const store = global.rateLimitStore
  const requests = store.get(key) || []

  // 윈도우 밖의 요청들 제거
  const validRequests = requests.filter(timestamp => timestamp > windowStart)

  if (validRequests.length >= maxRequests) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      'medium'
    )
  }

  // 현재 요청 추가
  validRequests.push(now)
  store.set(key, validRequests)

  return true
}

// 입력 sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // 기본적인 HTML 태그 방지
    .replace(/javascript:/gi, '') // JavaScript URL 방지
    .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 방지
}

// 이메일 검증 (향후 사용자 인증용)
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '이메일을 입력해주세요.',
      'high'
    )
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '올바른 이메일 형식을 입력해주세요.',
      'high'
    )
  }

  return email.toLowerCase().trim()
}

// 비밀번호 검증 (향후 사용자 인증용)
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '비밀번호를 입력해주세요.',
      'high'
    )
  }

  if (password.length < 8) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '비밀번호는 8자 이상이어야 합니다.',
      'high'
    )
  }

  if (password.length > 128) {
    throw new GameError(
      ERROR_TYPES.VALIDATION,
      '비밀번호는 128자 이하여야 합니다.',
      'high'
    )
  }

  return password
}
