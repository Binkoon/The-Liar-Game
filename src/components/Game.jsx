import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import LazyGamePhase from './LazyGamePhase';
import Chat from './Chat';
import PageTransition from './PageTransition';
import SuspicionAnnouncement from './SuspicionAnnouncement';
import FinalSpeechAnnouncement from './FinalSpeechAnnouncement';
import '../styles/Game.css';
import '../styles/LoadingSpinner.css';

const Game = ({ players, onBackToLobby, currentPlayer }) => {
  const {
    gameState,
    currentPlayerId,
    currentSpeaker,
    gamePhase,
    showRoleAssignment,
    showWordAnnouncement,
    suspectedPlayer,
    explanations,
    isExplanationLogVisible,
    chatMessages,
    isChatVisible,
    error,
    isLoading,
    clearError,
    initializeGame,
    selectTopic,
    confirmRole,
    completeRoleAssignment,
    nextSpeaker,
    vote,
    startFinalSpeech,
    startWithdrawal,
    withdrawVote,
    calculateResult,
    calculateVoteResult,
    checkLiarAnswer,
    addExplanation,
    toggleExplanationLog,
    toggleWordAnnouncement,
    addChatMessage,
    toggleChat,
    getCurrentPlayer,
    getCurrentSpeaker,
    isExplanationLogDisabled,
    resetGame,
    setGamePhase,
    updateGameStateFromSync
  } = useGameStore();

  useEffect(() => {
    // 참여자(playing 상태)만 게임에 포함
    const playingPlayers = players.filter(p => p.status === 'playing');
    initializeGame(playingPlayers);
  }, [players, initializeGame]);

  // 플레이어 수가 변경될 때 게임 상태 동기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.realtimeSync) {
      const playingPlayers = players.filter(p => p.status === 'playing');
      if (playingPlayers.length >= 3 && gamePhase === 'topic_selection') {
        // 플레이어가 충분하면 게임 상태를 동기화
        window.realtimeSync.getGameState().then(gameState => {
          if (gameState && gameState.gamePhase !== 'topic_selection') {
            updateGameStateFromSync(gameState);
          }
        });
      }
    }
  }, [players, gamePhase, updateGameStateFromSync]);

  // 실시간 동기화 리스너 등록
  useEffect(() => {
    if (typeof window !== 'undefined' && window.realtimeSync) {
      const handleGameStateUpdate = (event, data) => {
        if (event === 'gameStateUpdated') {
          // 게임 상태가 업데이트되면 store에 반영
          updateGameStateFromSync(data);
        }
      };

      // 리스너 등록
      window.realtimeSync.addListener(handleGameStateUpdate);

      // 정리 함수
      return () => {
        if (window.realtimeSync && window.realtimeSync.removeListener) {
          window.realtimeSync.removeListener(handleGameStateUpdate);
        }
      };
    }
  }, [updateGameStateFromSync]);

  const getCurrentPhase = () => {
    if (gamePhase === 'topic_selection') {
      return 'topic_selection';
    }
    if (showRoleAssignment) {
      return 'role_confirmation'; // role_assignment가 아니라 role_confirmation으로 수정
    }
    return gamePhase;
  };

  const getPhaseProps = (phase) => {
    const currentPlayer = getCurrentPlayer();
    
    const baseProps = {
      gameState,
      currentPlayerId,
      currentPlayer
    };

    switch (phase) {
      case 'topic_selection':
        return {
          ...baseProps,
          onTopicSelected: selectTopic,
          onBackToLobby
        };
      case 'role_confirmation':
        return {
          ...baseProps,
          onComplete: completeRoleAssignment,
          onConfirmRole: confirmRole,
        };
      case 'explanation':
        return {
          ...baseProps,
          currentPlayer: getCurrentPlayer(),
          currentSpeaker: currentSpeaker,
          onNextSpeaker: nextSpeaker,
          onAddExplanation: addExplanation,
          onStartVoting: () => setGamePhase('voting')
        };
      case 'voting':
        return {
          ...baseProps,
          currentPlayer: getCurrentPlayer(),
          onVote: vote,
          onStartFinalSpeech: startFinalSpeech
        };
      case 'final_speech':
        return {
          ...baseProps,
          currentPlayer: getCurrentPlayer(),
          suspectedPlayer: suspectedPlayer,
          onStartWithdrawal: startWithdrawal,
          onCalculateResult: calculateResult,
          onLiarAnswer: checkLiarAnswer,
          calculateVoteResult: calculateVoteResult
        };
      case 'withdrawal':
        return {
          ...baseProps,
          onWithdrawVote: withdrawVote,
          onCalculateResult: calculateResult,
          calculateVoteResult: calculateVoteResult
        };
      case 'result':
        return {
          ...baseProps,
          onBackToLobby,
          onNewGame: () => {
            resetGame();
            initializeGame(players);
          },
          calculateVoteResult: calculateVoteResult
        };
      default:
        return baseProps;
    }
  };

  const currentPhase = getCurrentPhase();

  // 관전자 모드 확인
  const isSpectator = currentPlayer && currentPlayer.status === 'spectating';

  // 에러 표시
  if (error) {
    return (
      <motion.div 
        className="game-error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="error-content">
          <h2>❌ 오류가 발생했습니다</h2>
          <p>{error}</p>
          <button 
            onClick={clearError}
            className="error-retry-btn"
          >
            다시 시도
          </button>
        </div>
      </motion.div>
    );
  }

  // 관전자 모드 UI
  if (isSpectator) {
    return (
      <div className="game spectator-mode">
        <div className="spectator-header">
          <h2>👁️ 관전자 모드</h2>
          <p>게임을 관전하고 있습니다</p>
        </div>
        
        <div className="game-content">
          <PageTransition transitionKey={currentPhase}>
            <LazyGamePhase
              phase={currentPhase}
              {...getPhaseProps(currentPhase)}
              spectatorMode={true}
            />
          </PageTransition>
        </div>

        <Chat
          messages={chatMessages}
          onSendMessage={addChatMessage}
          currentPlayer={getCurrentPlayer()}
          isVisible={isChatVisible}
          onToggleVisibility={toggleChat}
          disabled={true} // 관전자는 채팅도 제한
          explanations={explanations}
          onAddExplanation={addExplanation}
          currentSpeaker={getCurrentSpeaker()}
          allPlayers={gameState?.players || []}
          onAddExplanationAsPlayer={() => {}} // 관전자는 설명 추가 불가
          spectatorMode={true}
        />
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <motion.div 
        className="game-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>게임을 준비하는 중...</p>
        </div>
      </motion.div>
    );
  }

  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return (
      <motion.div 
        className="game-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2>게임을 준비하는 중...</h2>
        <p>플레이어: {players.length}명</p>
        <p>게임 상태: {gameState ? '초기화됨' : '초기화 안됨'}</p>
      </motion.div>
    );
  }

  return (
    <div className="game">
      <motion.div 
        className="game-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="game-title">라이어 게임</h1>
        <div className="game-info">
          <span className="game-phase">{gamePhase}</span>
          <span className="player-count">{players.length}명</span>
        </div>
      </motion.div>

      {/* 제시어 공지 - 라이어가 아닌 플레이어에게만 표시 */}
      {gameState && gameState.topic && gamePhase === 'explanation' && showWordAnnouncement && (
        <div className="word-announcement">
          <div className="word-announcement-content">
            <div className="word-announcement-header">
              <h2>🎯 제시어</h2>
              <button 
                className="word-announcement-close"
                onClick={toggleWordAnnouncement}
              >
                ✕
              </button>
            </div>
            <div className="word-announcement-topic">
              <span className="topic-label">주제:</span>
              <span className="topic-value">{gameState.topic}</span>
            </div>
            {getCurrentPlayer()?.role !== 'liar' ? (
              <>
                <div className="word-announcement-word">
                  <span className="word-label">단어:</span>
                  <span className="word-value">{gameState.word}</span>
                </div>
                <div className="word-announcement-note">
                  <p>💡 라이어는 단어를 모르므로 유추해서 설명하세요!</p>
                </div>
              </>
            ) : (
              <div className="word-announcement-note">
                <p>🎭 당신은 라이어입니다! 단어를 유추해서 설명하세요!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 의심받는 플레이어 공지 */}
      {gamePhase === 'suspicion_announcement' && (
        <SuspicionAnnouncement
          suspectedPlayer={suspectedPlayer}
          onStartFinalSpeech={startFinalSpeech}
        />
      )}

      {/* 최후발언 공지 */}
      {gamePhase === 'final_speech' && (
        <FinalSpeechAnnouncement
          suspectedPlayer={suspectedPlayer}
          onCompleteSpeech={(speechText) => {
            // 최후발언 완료 처리 (필요시 설명 로그에 추가)
          }}
          onStartWithdrawal={startWithdrawal}
        />
      )}

      <div className="game-content">
        <PageTransition transitionKey={currentPhase}>
          <LazyGamePhase
            phase={currentPhase}
            {...getPhaseProps(currentPhase)}
          />
        </PageTransition>
      </div>

      {/* 채팅과 설명 기록을 가로로 배치 */}
      <div className="game-bottom-section">
        <Chat
          messages={chatMessages}
          onSendMessage={addChatMessage}
          currentPlayer={getCurrentPlayer()}
          isVisible={isChatVisible}
          onToggleVisibility={toggleChat}
          disabled={gamePhase === 'topic_selection' || gamePhase === 'role_confirmation' || gamePhase === 'result'}
          explanations={explanations}
          onAddExplanation={addExplanation}
          currentSpeaker={getCurrentSpeaker()}
          allPlayers={gameState?.players || []}
          onAddExplanationAsPlayer={(playerId, explanationText) => {
            const player = gameState?.players.find(p => p.id === playerId);
            if (player) {
              addExplanation(explanationText, player.name);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Game;