import { proxy } from 'valtio';

// 게임 상태를 순수 객체로 관리
const createInitialGameState = () => ({
  players: [],
  currentSpeakerIndex: 0,
  votes: {},
  topic: null,
  word: null,
  gamePhase: 'topic_selection',
  currentState: 'waiting'
});

// 유틸리티 함수들
export const gameUtils = {
  // 현재 발언자 가져오기
  getCurrentSpeaker: (state) => {
    return state.players[state.currentSpeakerIndex] || null;
  },

  // 다음 발언자로 이동
  nextSpeaker: (state) => {
    const currentPlayer = gameUtils.getCurrentSpeaker(state);
    if (currentPlayer) {
      currentPlayer.hasSpoken = true;
    }
    
    const newIndex = (state.currentSpeakerIndex + 1) % state.players.length;
    state.currentSpeakerIndex = newIndex;
  },

  // 모든 플레이어가 발언했는지 확인
  allPlayersSpoken: (state) => {
    return state.players.every(p => p.hasSpoken);
  },

  // 투표 결과 계산
  calculateVoteResult: (state) => {
    const voteCounts = {};
    Object.values(state.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    if (Object.keys(voteCounts).length === 0) {
      return {
        mostVotedPlayer: null,
        voteCounts,
        totalVotes: 0,
        tie: false,
        isTie: false
      };
    }

    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedPlayers = Object.keys(voteCounts).filter(
      playerId => voteCounts[playerId] === maxVotes
    );

    const isTie = mostVotedPlayers.length > 1;
    const mostVotedPlayer = isTie ? null : mostVotedPlayers[0];

    return {
      mostVotedPlayer,
      voteCounts,
      totalVotes: Object.keys(state.votes).length,
      tie: isTie,
      isTie,
      mostVotedPlayers: isTie ? mostVotedPlayers : [mostVotedPlayer]
    };
  },

  // 역할 배정
  assignRoles: (state, playerCount) => {
    let roles = [];
    
    if (playerCount >= 8) {
      // 8명 이상: 일반인 5~7명, 광신도 1명, 라이어 2명
      const civilianCount = Math.floor(Math.random() * 3) + 5; // 5, 6, 7 중 랜덤
      roles = [
        ...Array(civilianCount).fill('civilian'),
        'fanatic',
        'liar',
        'liar'
      ];
    } else if (playerCount >= 6) {
      // 6~7명: 일반인 4~5명, 광신도 1명, 라이어 1명
      const civilianCount = Math.floor(Math.random() * 2) + 4; // 4, 5 중 랜덤
      roles = [
        ...Array(civilianCount).fill('civilian'),
        'fanatic',
        'liar'
      ];
    } else {
      // 6명 미만: 일반인 (n-1)명, 라이어 1명 (광신도 없음)
      roles = [
        ...Array(playerCount - 1).fill('civilian'),
        'liar'
      ];
    }

    // 역할을 랜덤하게 섞기
    const shuffledRoles = [...roles];
    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
    }

    // 플레이어들에게 역할 배정
    const updatedPlayers = state.players.map((player, index) => ({
      ...player,
      role: shuffledRoles[index],
      roleConfirmed: false,
      hasSpoken: false
    }));

    // 발언 순서 완전 랜덤화 (Fisher-Yates 셔플 알고리즘)
    const shuffledPlayers = [...updatedPlayers];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }

    // 상태 업데이트
    state.players = shuffledPlayers;
    state.currentSpeakerIndex = 0;
  }
};

// 에러 핸들링 유틸리티
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  return {
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    context
  };
};

// 유효성 검사 함수들
export const validators = {
  players: (players) => {
    if (!Array.isArray(players)) {
      throw new Error('플레이어 목록이 올바르지 않습니다.');
    }
    if (players.length < 3) {
      throw new Error('최소 3명의 플레이어가 필요합니다.');
    }
    if (players.length > 10) {
      throw new Error('최대 10명의 플레이어만 참여할 수 있습니다.');
    }
    return true;
  },

  topic: (topic) => {
    if (!topic || typeof topic !== 'string') {
      throw new Error('유효한 주제를 선택해주세요.');
    }
    return true;
  },

  playerId: (playerId) => {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('유효한 플레이어 ID가 필요합니다.');
    }
    return true;
  }
};

// Valtio Proxy 상태
export const gameState = proxy({
  // 게임 상태 (단일화)
  gameState: createInitialGameState(),
  currentPlayerId: null,
  currentSpeaker: null,
  gamePhase: 'topic_selection',
  showRoleAssignment: false,
  showWordAnnouncement: true,
  suspectedPlayer: null,
  explanations: [],
  isExplanationLogVisible: true,
  chatMessages: [],
  isChatVisible: true,
  error: null,
  isLoading: false,

  // 액션 함수들
  actions: {
    // 에러 클리어
    clearError: () => {
      gameState.error = null;
    },

    // 로딩 상태 설정
    setLoading: (loading) => {
      gameState.isLoading = loading;
    },

    // 게임 초기화
    initializeGame: (players) => {
      try {
        validators.players(players);
        
        gameState.isLoading = true;
        gameState.error = null;
        
        const gamePlayers = players.map((player) => ({
          id: player.id, // 기존 ID 유지
          name: player.name,
          role: null,
          roleConfirmed: false,
          hasSpoken: false,
          isDead: false
        }));

        const newGameState = {
          ...createInitialGameState(),
          players: gamePlayers
        };

        gameState.gameState = newGameState;
        gameState.currentPlayerId = gamePlayers[0]?.id || null;
        gameState.currentSpeaker = gamePlayers[0] || null;
        gameState.gamePhase = 'topic_selection';
        gameState.showRoleAssignment = false;
        gameState.showWordAnnouncement = true;
        gameState.suspectedPlayer = null;
        gameState.explanations = [];
        gameState.isExplanationLogVisible = true;
        gameState.chatMessages = [];
        gameState.isChatVisible = true;
        gameState.error = null;
        gameState.isLoading = false;

      } catch (error) {
        const errorInfo = handleError(error, 'initializeGame');
        gameState.error = errorInfo.error;
        gameState.isLoading = false;
      }
    },

    // 주제 선택
    selectTopic: (selectedTopic) => {
      try {
        validators.topic(selectedTopic);
        
        // 실시간 동기화에서 실제 플레이어 수 확인
        let actualPlayerCount = gameState.gameState.players.length;
        if (typeof window !== 'undefined' && window.realtimeSync) {
          const allPlayers = window.realtimeSync.getAllPlayers();
          actualPlayerCount = allPlayers.filter(p => p.status === 'playing').length;
        }
        
        if (actualPlayerCount < 3) {
          throw new Error('최소 3명의 플레이어가 필요합니다.');
        }
        
        // 주제 선택과 동시에 역할 배정
        gameState.gameState.topic = selectedTopic;
        gameState.gameState.word = '랜덤단어'; // 실제로는 주제에 따른 랜덤 단어 선택
        
        gameUtils.assignRoles(gameState.gameState, actualPlayerCount);

        gameState.gamePhase = 'role_confirmation';
        gameState.showRoleAssignment = true;
        gameState.currentSpeaker = gameUtils.getCurrentSpeaker(gameState.gameState);
        gameState.error = null;

        // Firebase 실시간 동기화를 통해 다른 플레이어들에게 상태 전달
        if (typeof window !== 'undefined' && window.realtimeSync) {
          window.realtimeSync.updateGameState({
            gameState: gameState.gameState,
            gamePhase: gameState.gamePhase,
            showRoleAssignment: gameState.showRoleAssignment,
            currentSpeaker: gameState.currentSpeaker
          });
        }

      } catch (error) {
        const errorInfo = handleError(error, 'selectTopic');
        gameState.error = errorInfo.error;
      }
    },

    // 역할 확인
    confirmRole: (playerId) => {
      try {
        validators.playerId(playerId);
        
        const playerIndex = gameState.gameState.players.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1) {
          throw new Error('플레이어를 찾을 수 없습니다.');
        }

        gameState.gameState.players[playerIndex].roleConfirmed = true;

        const allConfirmed = gameState.gameState.players.every(p => p.roleConfirmed);

        gameState.gamePhase = allConfirmed ? 'explanation' : 'role_confirmation';
        gameState.error = null;

      } catch (error) {
        const errorInfo = handleError(error, 'confirmRole');
        gameState.error = errorInfo.error;
      }
    },

    // 역할 배정 완료 (게임 시작)
    completeRoleAssignment: () => {
      try {
        // 실시간 동기화에서 실제 플레이어 수 확인
        let actualPlayerCount = gameState.gameState.players.length;
        if (typeof window !== 'undefined' && window.realtimeSync) {
          const allPlayers = window.realtimeSync.getAllPlayers();
          actualPlayerCount = allPlayers.filter(p => p.status === 'playing').length;
        }
        
        if (actualPlayerCount < 3) {
          throw new Error('최소 3명의 플레이어가 필요합니다.');
        }

        // 모든 플레이어가 역할을 확인했는지 확인
        const allConfirmed = gameState.gameState.players.every(p => p.roleConfirmed);
        if (!allConfirmed) {
          throw new Error('모든 플레이어가 역할을 확인해야 합니다.');
        }
        
        // 게임 상태를 완전히 업데이트
        gameState.gameState.gamePhase = 'explanation';
        gameState.gamePhase = 'explanation';
        gameState.showRoleAssignment = false;
        gameState.error = null;

      } catch (error) {
        const errorInfo = handleError(error, 'completeRoleAssignment');
        gameState.error = errorInfo.error;
      }
    },

    // 다음 발언자
    nextSpeaker: (explanationText = null) => {
      try {
        if (!gameState.gameState) {
          throw new Error('게임 상태가 초기화되지 않았습니다.');
        }

        // 설명이 있으면 먼저 추가
        if (explanationText) {
          const currentPlayer = gameUtils.getCurrentSpeaker(gameState.gameState);
          if (currentPlayer) {
            const newExplanation = {
              id: Date.now(),
              playerId: currentPlayer.id,
              playerName: currentPlayer.name,
              text: explanationText,
              timestamp: Date.now()
            };
            gameState.explanations.push(newExplanation);
          }
        }
        
        // 다음 발언자로 이동
        gameUtils.nextSpeaker(gameState.gameState);
        gameState.currentSpeaker = gameUtils.getCurrentSpeaker(gameState.gameState);
        const allSpoken = gameUtils.allPlayersSpoken(gameState.gameState);
        
        gameState.gamePhase = allSpoken ? 'voting' : 'explanation';
        gameState.error = null;
      } catch (error) {
        const errorInfo = handleError(error, 'nextSpeaker');
        gameState.error = errorInfo.error;
      }
    },

    // 투표
    vote: (voterId, targetId) => {
      try {
        validators.playerId(voterId);
        validators.playerId(targetId);
        
        if (!gameState.gameState) {
          throw new Error('게임 상태가 초기화되지 않았습니다.');
        }

        gameState.gameState.votes[voterId] = targetId;

        // 모든 플레이어가 투표했으면 투표 결과 계산
        if (Object.keys(gameState.gameState.votes).length === gameState.gameState.players.length) {
          const voteResult = gameUtils.calculateVoteResult(gameState.gameState);
          
          if (voteResult.isTie) {
            // 무승부인 경우 재투표
            gameState.gameState.votes = {}; // 투표 초기화
            gameState.gamePhase = 'revote';
          } else {
            // 승부가 난 경우
            const suspectedPlayer = gameState.gameState.players.find(p => p.id === voteResult.mostVotedPlayer);
            gameState.gamePhase = 'suspicion_announcement';
            gameState.suspectedPlayer = suspectedPlayer;
          }
        }

        gameState.error = null;

      } catch (error) {
        const errorInfo = handleError(error, 'vote');
        gameState.error = errorInfo.error;
      }
    },

    // 최후의 발언 시작
    startFinalSpeech: () => {
      try {
        gameState.gamePhase = 'final_speech';
        gameState.error = null;
      } catch (error) {
        const errorInfo = handleError(error, 'startFinalSpeech');
        gameState.error = errorInfo.error;
      }
    },

    // 철회 시작
    startWithdrawal: () => {
      try {
        gameState.gamePhase = 'withdrawal';
        gameState.error = null;
      } catch (error) {
        const errorInfo = handleError(error, 'startWithdrawal');
        gameState.error = errorInfo.error;
      }
    },

    // 투표 철회
    withdrawVote: (playerId) => {
      try {
        validators.playerId(playerId);
        
        if (!gameState.gameState) {
          throw new Error('게임 상태가 초기화되지 않았습니다.');
        }

        delete gameState.gameState.votes[playerId];
        gameState.error = null;

      } catch (error) {
        const errorInfo = handleError(error, 'withdrawVote');
        gameState.error = errorInfo.error;
      }
    },

    // 결과 계산
    calculateResult: () => {
      try {
        gameState.gamePhase = 'result';
        gameState.error = null;
      } catch (error) {
        const errorInfo = handleError(error, 'calculateResult');
        gameState.error = errorInfo.error;
      }
    },

    // 라이어 답변 확인
    checkLiarAnswer: (answer) => {
      try {
        if (!answer || typeof answer !== 'string') {
          throw new Error('유효한 답변을 입력해주세요.');
        }

        const isCorrect = answer.toLowerCase().includes(gameState.gameState.word?.toLowerCase() || '');
        
        gameState.gamePhase = 'result';
        gameState.error = null;

        return isCorrect;
      } catch (error) {
        const errorInfo = handleError(error, 'checkLiarAnswer');
        gameState.error = errorInfo.error;
        return false;
      }
    },

    // 설명 추가
    addExplanation: (explanationText, playerName = null) => {
      try {
        if (!explanationText || typeof explanationText !== 'string') {
          throw new Error('유효한 설명을 입력해주세요.');
        }

        const currentPlayer = gameState.gameState.players.find(p => p.id === gameState.currentPlayerId);
        
        if (!currentPlayer && !playerName) {
          throw new Error('현재 플레이어를 찾을 수 없습니다.');
        }

        const targetPlayer = playerName 
          ? gameState.gameState.players.find(p => p.name === playerName)
          : currentPlayer;

        if (!targetPlayer) {
          throw new Error('플레이어를 찾을 수 없습니다.');
        }

        const newExplanation = {
          id: Date.now(),
          playerId: targetPlayer.id,
          playerName: targetPlayer.name,
          text: explanationText,
          timestamp: Date.now()
        };

        gameState.explanations.push(newExplanation);

        // 개발 모드에서 hasSpoken 업데이트
        if (playerName && gameState.gameState) {
          const gamePlayer = gameState.gameState.players.find(p => p.name === playerName);
          if (gamePlayer && !gamePlayer.hasSpoken) {
            gamePlayer.hasSpoken = true;
          }
        }

      } catch (error) {
        const errorInfo = handleError(error, 'addExplanation');
        gameState.error = errorInfo.error;
      }
    },

    // UI 토글 함수들
    toggleExplanationLog: () => {
      gameState.isExplanationLogVisible = !gameState.isExplanationLogVisible;
    },
    
    toggleWordAnnouncement: () => {
      gameState.showWordAnnouncement = !gameState.showWordAnnouncement;
    },
    
    toggleChat: () => {
      gameState.isChatVisible = !gameState.isChatVisible;
    },

    // 채팅 메시지 추가
    addChatMessage: (message) => {
      try {
        if (!message || typeof message !== 'string') {
          throw new Error('유효한 메시지를 입력해주세요.');
        }

        const currentPlayer = gameState.gameState.players.find(p => p.id === gameState.currentPlayerId);
        
        if (!currentPlayer) {
          throw new Error('현재 플레이어를 찾을 수 없습니다.');
        }

        const newMessage = {
          id: Date.now(),
          playerId: gameState.currentPlayerId,
          playerName: currentPlayer.name,
          text: message,
          timestamp: Date.now()
        };

        gameState.chatMessages.push(newMessage);
        gameState.error = null;

      } catch (error) {
        const errorInfo = handleError(error, 'addChatMessage');
        gameState.error = errorInfo.error;
      }
    },

    // 현재 플레이어 가져오기
    getCurrentPlayer: () => {
      return gameState.gameState.players.find(p => p.id === gameState.currentPlayerId) || null;
    },

    // 현재 발언자 가져오기
    getCurrentSpeaker: () => {
      return gameUtils.getCurrentSpeaker(gameState.gameState);
    },

    // 설명 로그 비활성화 여부
    isExplanationLogDisabled: () => {
      return gameState.gamePhase === 'topic_selection' || gameState.gamePhase === 'role_confirmation';
    },

    // 투표 결과 계산
    calculateVoteResult: () => {
      if (!gameState.gameState) {
        return { mostVotedPlayer: null, voteCounts: {}, totalVotes: 0 };
      }
      return gameUtils.calculateVoteResult(gameState.gameState);
    },

    // 게임 단계 설정
    setGamePhase: (phase) => {
      try {
        gameState.gamePhase = phase;
        gameState.error = null;
      } catch (error) {
        const errorInfo = handleError(error, 'setGamePhase');
        gameState.error = errorInfo.error;
      }
    },

    // 외부에서 게임 상태 업데이트 (실시간 동기화용)
    updateGameStateFromSync: (newGameState) => {
      try {
        // currentPlayerId는 변경하지 않음 (호스트 상태 유지)
        if (newGameState.gameState) {
          Object.assign(gameState.gameState, newGameState.gameState);
        }
        if (newGameState.gamePhase) {
          gameState.gamePhase = newGameState.gamePhase;
        }
        if (newGameState.showRoleAssignment !== undefined) {
          gameState.showRoleAssignment = newGameState.showRoleAssignment;
        }
        if (newGameState.currentSpeaker) {
          gameState.currentSpeaker = newGameState.currentSpeaker;
        }
        
        gameState.error = null;
      } catch (error) {
        console.error('게임 상태 동기화 실패:', error);
      }
    },

    // 게임 리셋
    resetGame: () => {
      gameState.gameState = createInitialGameState();
      gameState.currentPlayerId = null;
      gameState.currentSpeaker = null;
      gameState.gamePhase = 'topic_selection';
      gameState.showRoleAssignment = false;
      gameState.showWordAnnouncement = true;
      gameState.suspectedPlayer = null;
      gameState.explanations = [];
      gameState.isExplanationLogVisible = true;
      gameState.chatMessages = [];
      gameState.isChatVisible = true;
      gameState.error = null;
      gameState.isLoading = false;
    }
  }
});

// 편의를 위한 훅들
export const useGameState = () => {
  return gameState;
};

export const useGameActions = () => {
  return gameState.actions;
};
