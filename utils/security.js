// 보안 유틸리티

// Rate Limiting (Redis 기반)
export class RateLimiter {
  constructor(redisClient) {
    this.redis = redisClient
  }

  async checkLimit(key, maxRequests, windowMs) {
    const now = Date.now()
    const windowStart = now - windowMs
    const redisKey = `rate_limit:${key}`

    try {
      // 현재 요청 수 조회
      const currentCount = await this.redis.zcard(redisKey)
      
      if (currentCount >= maxRequests) {
        return { allowed: false, remaining: 0, resetTime: windowStart + windowMs }
      }

      // 새로운 요청 추가
      await this.redis.zadd(redisKey, now, `${now}-${Math.random()}`)
      
      // 윈도우 밖의 요청들 제거
      await this.redis.zremrangebyscore(redisKey, 0, windowStart)
      
      // TTL 설정
      await this.redis.expire(redisKey, Math.ceil(windowMs / 1000))

      return { 
        allowed: true, 
        remaining: maxRequests - currentCount - 1, 
        resetTime: windowStart + windowMs 
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Redis 오류 시 허용 (fail-open)
      return { allowed: true, remaining: maxRequests, resetTime: now + windowMs }
    }
  }
}

// 입력 Sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // HTML 태그 방지
    .replace(/javascript:/gi, '') // JavaScript URL 방지
    .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 방지
    .replace(/data:/gi, '') // Data URL 방지
    .replace(/vbscript:/gi, '') // VBScript 방지
    .replace(/expression\s*\(/gi, '') // CSS expression 방지
}

// XSS 방지
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// SQL Injection 방지 (현재는 Redis 사용하지만 향후 DB 사용 시)
export const escapeSql = (text) => {
  return text
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z')
}

// CSRF 토큰 생성
export const generateCSRFToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// CSRF 토큰 검증
export const verifyCSRFToken = (token, sessionToken) => {
  return token && sessionToken && token === sessionToken
}

// 세션 보안 검증
export const validateSession = (sessionId, ipAddress, userAgent) => {
  // 세션 ID 형식 검증
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    return { valid: false, reason: 'Invalid session format' }
  }

  // IP 주소 검증 (기본적인 형식만)
  if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ipAddress)) {
    return { valid: false, reason: 'Invalid IP address' }
  }

  // User Agent 검증 (기본적인 길이 제한)
  if (!userAgent || userAgent.length > 1000) {
    return { valid: false, reason: 'Invalid user agent' }
  }

  return { valid: true }
}

// 권한 검증
export const checkPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'guest': 0,
    'player': 1,
    'host': 2,
    'admin': 3
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 파일 업로드 보안 검증
export const validateFileUpload = (file, allowedTypes, maxSize) => {
  if (!file) {
    return { valid: false, reason: 'No file provided' }
  }

  // 파일 크기 검증
  if (file.size > maxSize) {
    return { valid: false, reason: 'File too large' }
  }

  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, reason: 'Invalid file type' }
  }

  // 파일명 검증 (경로 조작 방지)
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, reason: 'Invalid filename' }
  }

  return { valid: true }
}

// 로그 보안 검증
export const sanitizeLogData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    // 민감한 정보 제거
    if (['password', 'token', 'secret', 'key'].some(sensitive => 
      key.toLowerCase().includes(sensitive)
    )) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// IP 화이트리스트 검증
export const isIPAllowed = (ip, whitelist) => {
  if (!whitelist || whitelist.length === 0) {
    return true
  }

  return whitelist.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR 표기법 처리 (간단한 구현)
      const [network, prefix] = allowedIP.split('/')
      // 실제로는 더 정교한 CIDR 검증이 필요
      return ip.startsWith(network.split('.').slice(0, Math.floor(prefix / 8)).join('.'))
    }
    return ip === allowedIP
  })
}

// 요청 헤더 검증
export const validateHeaders = (headers) => {
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]

  for (const header of suspiciousHeaders) {
    if (headers[header] && headers[header].length > 100) {
      return { valid: false, reason: `Suspicious header: ${header}` }
    }
  }

  return { valid: true }
}

// 게임 데이터 무결성 검증
export const validateGameDataIntegrity = (gameData) => {
  if (!gameData || typeof gameData !== 'object') {
    return { valid: false, reason: 'Invalid game data' }
  }

  // 필수 필드 검증
  const requiredFields = ['id', 'players', 'phase', 'createdAt']
  for (const field of requiredFields) {
    if (!(field in gameData)) {
      return { valid: false, reason: `Missing required field: ${field}` }
    }
  }

  // 플레이어 데이터 검증
  if (!Array.isArray(gameData.players)) {
    return { valid: false, reason: 'Players must be an array' }
  }

  // 플레이어 수 제한
  if (gameData.players.length > 8) {
    return { valid: false, reason: 'Too many players' }
  }

  return { valid: true }
}

// 보안 이벤트 로깅
export const logSecurityEvent = (event, details, severity = 'medium') => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details: sanitizeLogData(details),
    severity,
    source: 'security'
  }

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.warn('🚨 Security Event:', securityLog)
  }

  // 프로덕션에서는 보안 모니터링 시스템으로 전송
  if (process.env.NODE_ENV === 'production') {
    // TODO: 실제 보안 모니터링 서비스 연동
    // 보안 이벤트 로깅 (프로덕션)
  }
}

// 보안 미들웨어
export const securityMiddleware = (req, res, next) => {
  // 헤더 검증
  const headerValidation = validateHeaders(req.headers)
  if (!headerValidation.valid) {
    logSecurityEvent('suspicious_headers', { 
      headers: req.headers,
      reason: headerValidation.reason 
    }, 'high')
    return res.status(400).json({ error: 'Invalid request headers' })
  }

  // IP 검증 (필요시)
  const clientIP = req.ip || req.connection.remoteAddress
  if (!isIPAllowed(clientIP, process.env.ALLOWED_IPS?.split(','))) {
    logSecurityEvent('blocked_ip', { ip: clientIP }, 'high')
    return res.status(403).json({ error: 'Access denied' })
  }

  next()
}
