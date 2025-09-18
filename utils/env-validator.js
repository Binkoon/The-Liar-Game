// 환경변수 검증 유틸리티
export function validateEnvironmentVariables() {
  const requiredVars = [
    'REDIS_HOST',
    'REDIS_PORT',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SOCKET_URL'
  ]

  const optionalVars = [
    'REDIS_PASSWORD',
    'REDIS_USERNAME',
    'REDIS_TLS',
    'ADMIN_TOKEN',
    'NEXT_PUBLIC_CSRF_SECRET'
  ]

  const missing = []
  const warnings = []

  // 필수 환경변수 확인
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // 선택적 환경변수 확인 (경고만)
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  })

  // Redis 설정 검증
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    const port = parseInt(process.env.REDIS_PORT)
    if (isNaN(port) || port < 1 || port > 65535) {
      missing.push('REDIS_PORT (유효하지 않은 포트 번호)')
    }
  }

  // URL 형식 검증
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL)
    } catch {
      missing.push('NEXT_PUBLIC_APP_URL (유효하지 않은 URL 형식)')
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    summary: {
      total: requiredVars.length + optionalVars.length,
      required: requiredVars.length,
      optional: optionalVars.length,
      missing: missing.length,
      warnings: warnings.length
    }
  }
}

// 환경변수 상태 로깅
export function logEnvironmentStatus() {
  const validation = validateEnvironmentVariables()
  
  console.log('🔧 환경변수 상태:')
  console.log(`✅ 필수 변수: ${validation.summary.required - validation.missing.length}/${validation.summary.required}`)
  console.log(`⚠️  선택적 변수: ${validation.summary.optional - validation.warnings.length}/${validation.summary.optional}`)
  
  if (validation.missing.length > 0) {
    console.error('❌ 누락된 필수 환경변수:', validation.missing)
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  누락된 선택적 환경변수:', validation.warnings)
  }
  
  return validation
}

// 개발 환경에서만 실행
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus()
}
