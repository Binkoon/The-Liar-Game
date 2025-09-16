import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // 게임 상태
  gameState: 'lobby', // lobby, playing, ended
  currentPhase: 'waiting', // waiting, explanation, voting, result
  currentSpeaker: null,
  round: 0,
  maxRounds: 5,
  
  // 플레이어 정보
  players: [],
  currentPlayer: null,
  
  // 게임 설정
  topic: null,
  roles: {},
  
  // 투표 정보
  votes: {},
  votedPlayers: [],
  
  // 액션들
  setGameState: (state) => set({ gameState: state }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  setCurrentSpeaker: (playerId) => set({ currentSpeaker: playerId }),
  setTopic: (topic) => set({ topic }),
  setRoles: (roles) => set({ roles }),
  
  // 플레이어 관리
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  })),
  
  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    )
  })),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  // 투표 관리
  vote: (voterId, targetId) => set((state) => ({
    votes: {
      ...state.votes,
      [voterId]: targetId
    },
    votedPlayers: [...state.votedPlayers, voterId]
  })),
  
  clearVotes: () => set({ votes: {}, votedPlayers: [] }),
  
  // 게임 진행
  nextRound: () => set((state) => ({
    round: state.round + 1,
    votes: {},
    votedPlayers: []
  })),
  
  startGame: () => set({
    gameState: 'playing',
    currentPhase: 'explanation',
    round: 1
  }),
  
  endGame: () => set({
    gameState: 'ended',
    currentPhase: 'result'
  }),
  
  resetGame: () => set({
    gameState: 'lobby',
    currentPhase: 'waiting',
    currentSpeaker: null,
    round: 0,
    players: [],
    topic: null,
    roles: {},
    votes: {},
    votedPlayers: []
  })
}))

export default useGameStore
