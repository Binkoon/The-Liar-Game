// 게임 규칙 및 설정
export const gameRules = {
  // 기본 게임 설정
  minPlayers: 3,
  maxPlayers: 8,
  maxRounds: 5,
  explanationTime: 30, // 초
  votingTime: 30, // 초
  
  // 역할 설정
  roles: {
    civilian: {
      name: '일반인',
      description: '주제를 알고 있으며, 라이어를 찾아야 합니다.',
      color: '#4CAF50',
      count: 'majority' // 대부분의 플레이어
    },
    liar: {
      name: '라이어',
      description: '주제를 모르며, 정체를 숨기고 게임을 통과해야 합니다.',
      color: '#F44336',
      count: 1 // 항상 1명
    },
    fanatic: {
      name: '광신도',
      description: '주제를 알고 있지만 라이어를 도와야 합니다.',
      color: '#FF9800',
      count: 'conditional' // 특정 조건에서만
    }
  },
  
  // 게임 진행 단계
  phases: {
    waiting: '대기 중',
    explanation: '설명 단계',
    voting: '투표 단계',
    result: '결과 단계',
    ended: '게임 종료'
  },
  
  // 승리 조건
  winConditions: {
    civilian: '라이어를 찾아내는 것',
    liar: '모든 라운드를 통과하는 것',
    fanatic: '라이어가 승리하는 것'
  }
}

// 플레이어 수에 따른 역할 배정
export function assignRoles(playerCount) {
  const roles = {}
  
  const minPlayers = process.env.NODE_ENV === 'development' ? 2 : 3
  if (playerCount < minPlayers) {
    throw new Error(`최소 ${minPlayers}명의 플레이어가 필요합니다.`)
  }
  
  if (playerCount > gameRules.maxPlayers) {
    throw new Error(`최대 ${gameRules.maxPlayers}명의 플레이어만 참가할 수 있습니다.`)
  }
  
  // 라이어 1명 배정
  const liarIndex = Math.floor(Math.random() * playerCount)
  roles[`player_${liarIndex}`] = 'liar'
  
  // 광신도 배정 (5명 이상일 때만)
  let fanaticIndex = null
  if (playerCount >= 5) {
    do {
      fanaticIndex = Math.floor(Math.random() * playerCount)
    } while (fanaticIndex === liarIndex)
    roles[`player_${fanaticIndex}`] = 'fanatic'
  }
  
  // 나머지는 일반인
  for (let i = 0; i < playerCount; i++) {
    if (!roles[`player_${i}`]) {
      roles[`player_${i}`] = 'civilian'
    }
  }
  
  return roles
}

// 게임 결과 계산
export function calculateGameResult(votes, roles, round) {
  const voteCounts = {}
  
  // 투표 집계
  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })
  
  // 가장 많은 표를 받은 플레이어 찾기
  const maxVotes = Math.max(...Object.values(voteCounts))
  const mostVotedPlayers = Object.keys(voteCounts).filter(
    playerId => voteCounts[playerId] === maxVotes
  )
  
  // 동점인 경우 무작위 선택
  const eliminatedPlayer = mostVotedPlayers[
    Math.floor(Math.random() * mostVotedPlayers.length)
  ]
  
  const eliminatedRole = roles[eliminatedPlayer]
  
  // 승리 조건 확인
  if (eliminatedRole === 'liar') {
    return {
      winner: 'civilian',
      message: '라이어를 찾아냈습니다! 일반인 팀 승리!',
      eliminatedPlayer,
      eliminatedRole
    }
  } else if (round >= gameRules.maxRounds) {
    return {
      winner: 'liar',
      message: '모든 라운드를 통과했습니다! 라이어 승리!',
      eliminatedPlayer,
      eliminatedRole
    }
  } else {
    return {
      winner: null,
      message: `${eliminatedRole === 'fanatic' ? '광신도' : '일반인'}이 투표로 제외되었습니다.`,
      eliminatedPlayer,
      eliminatedRole,
      continueGame: true
    }
  }
}

// 게임 설정 검증
export function validateGameSettings(players, topic, roles) {
  const errors = []
  
  const minPlayers = process.env.NODE_ENV === 'development' ? 2 : 3
  if (players.length < minPlayers) {
    errors.push(`최소 ${minPlayers}명의 플레이어가 필요합니다.`)
  }
  
  if (players.length > gameRules.maxPlayers) {
    errors.push(`최대 ${gameRules.maxPlayers}명의 플레이어만 참가할 수 있습니다.`)
  }
  
  if (!topic) {
    errors.push('게임 주제가 선택되지 않았습니다.')
  }
  
  if (!roles || Object.keys(roles).length === 0) {
    errors.push('플레이어 역할이 배정되지 않았습니다.')
  }
  
  return errors
}
