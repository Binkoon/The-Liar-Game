import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
const gameUtils = {
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
    return {
      ...state,
      currentSpeakerIndex: newIndex
    };
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

    const mostVotedPlayer = Object.keys(voteCounts).reduce((a, b) => 
      voteCounts[a] > voteCounts[b] ? a : b, null
    );

    return {
      mostVotedPlayer,
      voteCounts,
      totalVotes: Object.keys(state.votes).length
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

    // 발언 순서 랜덤화
    const shuffledPlayers = [...updatedPlayers].sort(() => Math.random() - 0.5);


    return {
      ...state,
      players: shuffledPlayers,
      currentSpeakerIndex: 0
    };
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
const validators = {
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

export const useGameStore = create(
  devtools(
    (set, get) => ({
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

      // 에러 클리어
      clearError: () => set({ error: null }),

      // 로딩 상태 설정
      setLoading: (loading) => set({ isLoading: loading }),

      // 게임 초기화
      initializeGame: (players) => {
        try {
          validators.players(players);
          
          set({ isLoading: true, error: null });
          
          const gamePlayers = players.map((player, index) => ({
            id: `player_${Date.now()}_${index}`,
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

          set({
            gameState: newGameState,
            currentPlayerId: gamePlayers[0]?.id || null,
            currentSpeaker: gamePlayers[0] || null,
            gamePhase: 'topic_selection',
            showRoleAssignment: false,
            showWordAnnouncement: true,
            suspectedPlayer: null,
            explanations: [],
            isExplanationLogVisible: true,
            chatMessages: [],
            isChatVisible: true,
            error: null,
            isLoading: false
          });

        } catch (error) {
          const errorInfo = handleError(error, 'initializeGame');
          set({ error: errorInfo.error, isLoading: false });
        }
      },

      // 주제 선택
      selectTopic: (selectedTopic) => {
        try {
          validators.topic(selectedTopic);
          
          const { gameState } = get();
          
          // 주제 선택과 동시에 역할 배정
          const updatedGameState = gameUtils.assignRoles({
            ...gameState,
            topic: selectedTopic,
            word: '랜덤단어', // 실제로는 주제에 따른 랜덤 단어 선택
          }, gameState.players.length);

          set({
            gameState: updatedGameState,
            currentSpeaker: gameUtils.getCurrentSpeaker(updatedGameState),
            gamePhase: 'role_confirmation',
            showRoleAssignment: true,
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'selectTopic');
          set({ error: errorInfo.error });
        }
      },

      // 역할 확인
      confirmRole: (playerId) => {
        try {
          validators.playerId(playerId);
          
          const { gameState } = get();
          const playerIndex = gameState.players.findIndex(p => p.id === playerId);
          
          if (playerIndex === -1) {
            throw new Error('플레이어를 찾을 수 없습니다.');
          }

          const updatedPlayers = [...gameState.players];
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            roleConfirmed: true
          };

          const allConfirmed = updatedPlayers.every(p => p.roleConfirmed);

          set({
            gameState: {
              ...gameState,
              players: updatedPlayers
            },
            gamePhase: allConfirmed ? 'explanation' : 'role_confirmation',
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'confirmRole');
          set({ error: errorInfo.error });
        }
      },

      // 역할 배정 완료 (게임 시작)
      completeRoleAssignment: () => {
        try {
          const { gameState } = get();
          
          if (gameState.players.length < 3) {
            throw new Error('최소 3명의 플레이어가 필요합니다.');
          }

          // 모든 플레이어가 역할을 확인했는지 확인
          const allConfirmed = gameState.players.every(p => p.roleConfirmed);
          if (!allConfirmed) {
            throw new Error('모든 플레이어가 역할을 확인해야 합니다.');
          }
          
          set({
            gamePhase: 'explanation',
            showRoleAssignment: false,
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'completeRoleAssignment');
          set({ error: errorInfo.error });
        }
      },

      // 강제 역할 확인 (개발용)
      forceConfirmAllRoles: () => {
        try {
          const { gameState } = get();
          const updatedPlayers = gameState.players.map(p => ({ ...p, roleConfirmed: true }));
          
          set({
            gameState: {
              ...gameState,
              players: updatedPlayers
            },
            gamePhase: 'explanation',
            showRoleAssignment: false,
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'forceConfirmAllRoles');
          set({ error: errorInfo.error });
        }
      },

      // 다음 발언자
      nextSpeaker: (explanationText = null) => {
        try {
          const { gameState, explanations } = get();
          
          if (!gameState) {
            throw new Error('게임 상태가 초기화되지 않았습니다.');
          }

          // 설명이 있으면 먼저 추가
          if (explanationText) {
            const currentPlayer = gameUtils.getCurrentSpeaker(gameState);
            if (currentPlayer) {
              const newExplanation = {
                id: Date.now(),
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                text: explanationText,
                timestamp: Date.now()
              };
              set({ explanations: [...explanations, newExplanation] });
            }
          }
          
          // 다음 발언자로 이동
          const updatedGameState = gameUtils.nextSpeaker(gameState);
          const newCurrentSpeaker = gameUtils.getCurrentSpeaker(updatedGameState);
          const allSpoken = gameUtils.allPlayersSpoken(updatedGameState);
          
          
          set({
            gameState: updatedGameState,
            currentSpeaker: newCurrentSpeaker,
            gamePhase: allSpoken ? 'voting' : 'explanation',
            error: null
          });
        } catch (error) {
          const errorInfo = handleError(error, 'nextSpeaker');
          set({ error: errorInfo.error });
        }
      },

      // 투표
      vote: (voterId, targetId) => {
        try {
          validators.playerId(voterId);
          validators.playerId(targetId);
          
          const { gameState } = get();
          if (!gameState) {
            throw new Error('게임 상태가 초기화되지 않았습니다.');
          }

          const updatedGameState = {
            ...gameState,
            votes: {
              ...gameState.votes,
              [voterId]: targetId
            }
          };

          // 모든 플레이어가 투표했으면 투표 결과 계산
          if (Object.keys(updatedGameState.votes).length === gameState.players.length) {
            const voteResult = gameUtils.calculateVoteResult(updatedGameState);
            const suspectedPlayer = gameState.players.find(p => p.id === voteResult.mostVotedPlayer);
            
            set({
              gameState: updatedGameState,
              gamePhase: 'suspicion_announcement',
              suspectedPlayer: suspectedPlayer,
              error: null
            });
          } else {
            set({
              gameState: updatedGameState,
              error: null
            });
          }

        } catch (error) {
          const errorInfo = handleError(error, 'vote');
          set({ error: errorInfo.error });
        }
      },

      // 최후의 발언 시작
      startFinalSpeech: () => {
        try {
          set({
            gamePhase: 'final_speech',
            error: null
          });
        } catch (error) {
          const errorInfo = handleError(error, 'startFinalSpeech');
          set({ error: errorInfo.error });
        }
      },

      // 철회 시작
      startWithdrawal: () => {
        try {
          set({
            gamePhase: 'withdrawal',
            error: null
          });
        } catch (error) {
          const errorInfo = handleError(error, 'startWithdrawal');
          set({ error: errorInfo.error });
        }
      },

      // 투표 철회
      withdrawVote: (playerId) => {
        try {
          validators.playerId(playerId);
          
          const { gameState } = get();
          if (!gameState) {
            throw new Error('게임 상태가 초기화되지 않았습니다.');
          }

          const updatedVotes = { ...gameState.votes };
          delete updatedVotes[playerId];

          set({
            gameState: {
              ...gameState,
              votes: updatedVotes
            },
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'withdrawVote');
          set({ error: errorInfo.error });
        }
      },

      // 결과 계산
      calculateResult: () => {
        try {
          set({
            gamePhase: 'result',
            error: null
          });
        } catch (error) {
          const errorInfo = handleError(error, 'calculateResult');
          set({ error: errorInfo.error });
        }
      },

      // 라이어 답변 확인
      checkLiarAnswer: (answer) => {
        try {
          if (!answer || typeof answer !== 'string') {
            throw new Error('유효한 답변을 입력해주세요.');
          }

          const { gameState } = get();
          const isCorrect = answer.toLowerCase().includes(gameState.word?.toLowerCase() || '');
          
          set({
            gamePhase: 'result',
            error: null
          });

          return isCorrect;
        } catch (error) {
          const errorInfo = handleError(error, 'checkLiarAnswer');
          set({ error: errorInfo.error });
          return false;
        }
      },

      // 설명 추가
      addExplanation: (explanationText, playerName = null) => {
        try {
          if (!explanationText || typeof explanationText !== 'string') {
            throw new Error('유효한 설명을 입력해주세요.');
          }

          const { currentPlayerId, explanations, gameState } = get();
          const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
          
          if (!currentPlayer && !playerName) {
            throw new Error('현재 플레이어를 찾을 수 없습니다.');
          }

          const targetPlayer = playerName 
            ? gameState.players.find(p => p.name === playerName)
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

          set({ explanations: [...explanations, newExplanation] });

          // 개발 모드에서 hasSpoken 업데이트
          if (playerName && gameState) {
            const gamePlayer = gameState.players.find(p => p.name === playerName);
            if (gamePlayer && !gamePlayer.hasSpoken) {
              const updatedPlayers = gameState.players.map(p => 
                p.id === gamePlayer.id ? { ...p, hasSpoken: true } : p
              );
              set({ 
                gameState: { ...gameState, players: updatedPlayers }
              });
            }
          }

        } catch (error) {
          const errorInfo = handleError(error, 'addExplanation');
          set({ error: errorInfo.error });
        }
      },

      // UI 토글 함수들
      toggleExplanationLog: () => set(state => ({ 
        isExplanationLogVisible: !state.isExplanationLogVisible 
      })),
      
      toggleWordAnnouncement: () => set(state => ({ 
        showWordAnnouncement: !state.showWordAnnouncement 
      })),
      
      toggleChat: () => set(state => ({ 
        isChatVisible: !state.isChatVisible 
      })),

      // 채팅 메시지 추가
      addChatMessage: (message) => {
        try {
          if (!message || typeof message !== 'string') {
            throw new Error('유효한 메시지를 입력해주세요.');
          }

          const { chatMessages, currentPlayerId, gameState } = get();
          const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
          
          if (!currentPlayer) {
            throw new Error('현재 플레이어를 찾을 수 없습니다.');
          }

          const newMessage = {
            id: Date.now(),
            playerId: currentPlayerId,
            playerName: currentPlayer.name,
            text: message,
            timestamp: Date.now()
          };

          set({ 
            chatMessages: [...chatMessages, newMessage],
            error: null
          });

        } catch (error) {
          const errorInfo = handleError(error, 'addChatMessage');
          set({ error: errorInfo.error });
        }
      },

      // 현재 플레이어 가져오기
      getCurrentPlayer: () => {
        const { currentPlayerId, gameState } = get();
        return gameState.players.find(p => p.id === currentPlayerId) || null;
      },

      // 현재 발언자 가져오기
      getCurrentSpeaker: () => {
        const { gameState } = get();
        return gameUtils.getCurrentSpeaker(gameState);
      },

      // 설명 로그 비활성화 여부
      isExplanationLogDisabled: () => {
        const { gamePhase } = get();
        return gamePhase === 'topic_selection' || gamePhase === 'role_confirmation';
      },

      // 투표 결과 계산
      calculateVoteResult: () => {
        const { gameState } = get();
        if (!gameState) {
          return { mostVotedPlayer: null, voteCounts: {}, totalVotes: 0 };
        }
        return gameUtils.calculateVoteResult(gameState);
      },

      // 게임 단계 설정
      setGamePhase: (phase) => {
        try {
          set({ gamePhase: phase, error: null });
        } catch (error) {
          const errorInfo = handleError(error, 'setGamePhase');
          set({ error: errorInfo.error });
        }
      },

      // 게임 리셋
      resetGame: () => {
        set({
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
          isLoading: false
        });
      }
    }),
    {
      name: 'liar-game-store',
      partialize: (state) => ({
        gameState: state.gameState,
        currentPlayerId: state.currentPlayerId,
        gamePhase: state.gamePhase
      })
    }
  )
);