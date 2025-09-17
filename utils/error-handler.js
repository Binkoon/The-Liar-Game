// 에러 처리 유틸리티

// 에러 타입 정의
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  GAME_LOGIC: 'GAME_LOGIC_ERROR',
  SOCKET: 'SOCKET_ERROR',
  REDIS: 'REDIS_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// 에러 심각도 레벨
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// 사용자 친화적 에러 메시지
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    CONNECTION_FAILED: '연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
    TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    SERVER_ERROR: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  [ERROR_TYPES.VALIDATION]: {
    INVALID_NAME: '올바른 이름을 입력해주세요.',
    NAME_TOO_LONG: '이름은 20자 이하로 입력해주세요.',
    NAME_TOO_SHORT: '이름은 1자 이상 입력해주세요.',
    INVALID_ROOM_CODE: '올바른 방 코드를 입력해주세요.',
    INVALID_INPUT: '입력값이 올바르지 않습니다.'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    UNAUTHORIZED: '인증이 필요합니다.',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.'
  },
  [ERROR_TYPES.AUTHORIZATION]: {
    FORBIDDEN: '권한이 없습니다.',
    HOST_ONLY: '호스트만 가능한 작업입니다.'
  },
  [ERROR_TYPES.GAME_LOGIC]: {
    GAME_NOT_STARTED: '게임이 시작되지 않았습니다.',
    INVALID_PHASE: '현재 단계에서 불가능한 작업입니다.',
    PLAYER_NOT_FOUND: '플레이어를 찾을 수 없습니다.',
    ROOM_FULL: '방이 가득 찼습니다.',
    ROOM_NOT_FOUND: '방을 찾을 수 없습니다.'
  },
  [ERROR_TYPES.SOCKET]: {
    CONNECTION_LOST: '연결이 끊어졌습니다. 재연결을 시도합니다.',
    RECONNECTION_FAILED: '재연결에 실패했습니다. 페이지를 새로고침해주세요.',
    MESSAGE_SEND_FAILED: '메시지 전송에 실패했습니다.'
  },
  [ERROR_TYPES.REDIS]: {
    CONNECTION_FAILED: '데이터베이스 연결에 실패했습니다.',
    SAVE_FAILED: '데이터 저장에 실패했습니다.',
    LOAD_FAILED: '데이터 로드에 실패했습니다.'
  },
  [ERROR_TYPES.UNKNOWN]: {
    DEFAULT: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}

// 커스텀 에러 클래스
export class GameError extends Error {
  constructor(type, message, severity = ERROR_SEVERITY.MEDIUM, originalError = null) {
    super(message)
    this.name = 'GameError'
    this.type = type
    this.severity = severity
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

// 에러 로깅 함수
export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: error.type || ERROR_TYPES.UNKNOWN,
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    message: error.message,
    stack: error.stack,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Game Error:', errorLog)
  }

  // 프로덕션에서는 에러 추적 서비스로 전송 (예: Sentry)
  if (process.env.NODE_ENV === 'production') {
    // TODO: 실제 에러 추적 서비스 연동
    // 에러 로깅 (프로덕션)
  }
}

// 에러 처리 래퍼 함수
export const handleError = (error, context = {}) => {
  let gameError

  if (error instanceof GameError) {
    gameError = error
  } else {
    // 일반 에러를 GameError로 변환
    gameError = new GameError(
      ERROR_TYPES.UNKNOWN,
      ERROR_MESSAGES[ERROR_TYPES.UNKNOWN].DEFAULT,
      ERROR_SEVERITY.MEDIUM,
      error
    )
  }

  // 에러 로깅
  logError(gameError, context)

  return gameError
}

// 사용자에게 표시할 에러 메시지 생성
export const getUserFriendlyMessage = (error) => {
  if (error instanceof GameError) {
    return error.message
  }

  // 네트워크 에러 처리
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return ERROR_MESSAGES[ERROR_TYPES.NETWORK].CONNECTION_FAILED
  }

  // 타임아웃 에러 처리
  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return ERROR_MESSAGES[ERROR_TYPES.NETWORK].TIMEOUT
  }

  // 기본 메시지
  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN].DEFAULT
}

// 에러 복구 가능성 확인
export const isRecoverableError = (error) => {
  if (error instanceof GameError) {
    return error.severity !== ERROR_SEVERITY.CRITICAL
  }
  
  // 네트워크 에러는 복구 가능
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return true
  }

  return false
}

// 에러 재시도 로직
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // 복구 불가능한 에러면 즉시 중단
      if (!isRecoverableError(error)) {
        throw error
      }

      // 마지막 시도가 아니면 대기
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}
