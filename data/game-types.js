// 게임 데이터 타입 정의

export const GAME_PHASES = {
  WAITING: 'waiting',
  PLAYING: 'playing', 
  ENDED: 'ended'
}

export const PLAYER_ROLES = {
  CIVILIAN: 'civilian',
  LIAR: 'liar',
  FANATIC: 'fanatic'
}

// 플레이어 정보
export const createPlayer = (socketId, sessionId, name, isHost = false) => ({
  socketId,
  sessionId,
  name: name.trim(),
  isHost,
  hasSpoken: false,
  isDead: false,
  joinedAt: Date.now()
})

// 방 정보
export const createRoom = (roomId) => ({
  id: roomId,
  players: [],
  phase: GAME_PHASES.WAITING,
  liar: null,
  subject: null,
  keyword: null,
  votes: {},
  currentSpeakerIndex: 0,
  round: 1,
  maxRounds: 5,
  createdAt: Date.now(),
  lastUpdatedAt: Date.now()
})

// 게임 설정
export const GAME_CONFIG = {
  MIN_PLAYERS: process.env.NODE_ENV === 'development' ? 2 : 3, // 개발환경에서는 2명, 프로덕션에서는 3명
  MAX_PLAYERS: 8,
  MAX_ROUNDS: 5,
  EXPLANATION_TIME: 30, // 초
  VOTING_TIME: 30 // 초
}

// Socket 이벤트 타입
export const SOCKET_EVENTS = {
  // 클라이언트 -> 서버
  JOIN_ROOM: 'joinRoom',
  NEXT_PHASE: 'nextPhase',
  ASK_IF_IM_LIAR: 'askIfImLiar',
  REVEAL_LIAR: 'revealLiar',
  VOTE: 'vote',
  SPEAK: 'speak',
  
  // 서버 -> 클라이언트
  JOIN_ROOM_SUCCESS: 'joinRoomSuccess',
  JOIN_ROOM_FAILED: 'joinRoomFailed',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PHASE_CHANGED: 'phaseChanged',
  ANSWER_IF_IM_LIAR: 'answerIfImLiar',
  LIAR_REVEALED: 'liarRevealed',
  UPDATE_PLAYERS: 'updatePlayers',
  SPEAK_SUCCESS: 'speakSuccess',
  SPEECH_MADE: 'speechMade',
  VOTE_SUCCESS: 'voteSuccess',
  VOTE_CASTED: 'voteCasted',
  VOTE_RESULT: 'voteResult',
  VOTING_STARTED: 'votingStarted',
  ROUND_STARTED: 'roundStarted',
  GAME_ENDED: 'gameEnded',
  ERROR: 'error'
}
