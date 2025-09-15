import React, { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, useCurrentPlayer, useCurrentSpeaker, useVoteResult } from '../contexts/GameContext';
import LazyGamePhase from './LazyGamePhase';
import Chat from './Chat';
import PageTransition from './PageTransition';
import SuspicionAnnouncement from './SuspicionAnnouncement';
import FinalSpeechAnnouncement from './FinalSpeechAnnouncement';
import '../styles/Game.css';
import '../styles/LoadingSpinner.css';

const Game = ({ players, onBackToLobby, currentPlayer }) => {
  // Context에서 상태와 액션 가져오기
  const {
    gameState: gameStateData,
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
    actions
  } = useGame();
  
  // 편의 훅들
  const currentPlayerFromContext = useCurrentPlayer();
  const currentSpeakerFromContext = useCurrentSpeaker();
  const voteResult = useVoteResult();

  useEffect(() => {
    // 참여자(playing 상태)만 게임에 포함
    const playingPlayers = players.filter(p => p.status === 'playing');
    actions.initializeGame(playingPlayers);
  }, [players, actions]);

  // 플레이어 수가 변경될 때 게임 상태 동기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.realtimeSync) {
      const playingPlayers = players.filter(p => p.status === 'playing');
      if (playingPlayers.length >= 3 && gamePhase === 'topic_selection') {
        // 플레이어가 충분하면 게임 상태를 동기화
        window.realtimeSync.getGameState().then(gameState => {
          if (gameState && gameState.gamePhase !== 'topic_selection') {
            actions.updateGameStateFromSync(gameState);
          }
        });
      }
    }
  }, [players, gamePhase, actions]);

  // 실시간 동기화 리스너 등록
  useEffect(() => {
    if (typeof window !== 'undefined' && window.realtimeSync) {
      const handleGameStateUpdate = (event, data) => {
        if (event === 'gameStateUpdated') {
          // 게임 상태가 업데이트되면 store에 반영
          actions.updateGameStateFromSync(data);
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
  }, [actions]);

  const getCurrentPhase = () => {
    if (gamePhase === 'topic_selection') {
      return 'topic_selection';
    }
    if (showRoleAssignment) {
      return 'role_confirmation'; // role_assignment가 아니라 role_confirmation으로 수정
    }
    return gamePhase;
  };

  // 메모이제이션된 phase props
  const getPhaseProps = useCallback((phase) => {
    const baseProps = {
      gameState: gameStateData,
      currentPlayerId,
      currentPlayer: currentPlayerFromContext
    };

    switch (phase) {
      case 'topic_selection':
        return {
          ...baseProps,
          onTopicSelected: actions.selectTopic,
          onBackToLobby
        };
      case 'role_confirmation':
        return {
          ...baseProps,
          onComplete: actions.completeRoleAssignment,
          onConfirmRole: actions.confirmRole,
        };
      case 'explanation':
        return {
          ...baseProps,
          currentPlayer: currentPlayerFromContext,
          currentSpeaker: currentSpeakerFromContext,
          onNextSpeaker: actions.nextSpeaker,
          onAddExplanation: actions.addExplanation,
          onStartVoting: () => actions.setGamePhase('voting')
        };
      case 'voting':
        return {
          ...baseProps,
          currentPlayer: currentPlayerFromContext,
          onVote: actions.vote,
          onStartFinalSpeech: actions.startFinalSpeech
        };
      case 'revote':
        return {
          ...baseProps,
          currentPlayer: currentPlayerFromContext,
          onVote: actions.vote,
          onStartFinalSpeech: actions.startFinalSpeech
        };
      case 'final_speech':
        return {
          ...baseProps,
          currentPlayer: currentPlayerFromContext,
          suspectedPlayer: suspectedPlayer,
          onStartWithdrawal: actions.startWithdrawal,
          onCalculateResult: actions.calculateResult,
          onLiarAnswer: actions.checkLiarAnswer,
          calculateVoteResult: voteResult
        };
      case 'withdrawal':
        return {
          ...baseProps,
          currentPlayerId,
          onWithdrawVote: actions.withdrawVote,
          onCalculateResult: actions.calculateResult,
          calculateVoteResult: voteResult
        };
      case 'result':
        return {
          ...baseProps,
          onBackToLobby,
          onNewGame: () => {
            actions.resetGame();
            actions.initializeGame(players);
          },
          calculateVoteResult: voteResult
        };
      default:
        return baseProps;
    }
  }, [
    gameStateData, 
    currentPlayerId, 
    currentPlayerFromContext, 
    currentSpeakerFromContext,
    suspectedPlayer,
    voteResult,
    actions,
    onBackToLobby,
    players
  ]);

  const currentPhase = getCurrentPhase();
  
  // 메모이제이션된 phase props
  const phaseProps = useMemo(() => 
    getPhaseProps(currentPhase), 
    [getPhaseProps, currentPhase]
  );

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
            onClick={actions.clearError}
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
          onSendMessage={actions.addChatMessage}
          currentPlayer={currentPlayerFromContext}
          isVisible={isChatVisible}
          onToggleVisibility={actions.toggleChat}
          disabled={true} // 관전자는 채팅도 제한
          explanations={explanations}
          onAddExplanation={actions.addExplanation}
          currentSpeaker={currentSpeakerFromContext}
          allPlayers={gameStateData?.players || []}
          onAddExplanationAsPlayer={() => {}} // 관전자는 설명 추가 불가
          spectatorMode={true}
          gamePhase={gamePhase}
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

  if (!gameStateData || !gameStateData.players || gameStateData.players.length === 0) {
    return (
      <motion.div 
        className="game-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2>게임을 준비하는 중...</h2>
        <p>플레이어: {players.length}명</p>
        <p>게임 상태: {gameStateData ? '초기화됨' : '초기화 안됨'}</p>
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
      {gameStateData && gameStateData.topic && gamePhase === 'explanation' && showWordAnnouncement && (
        <div className="word-announcement">
          <div className="word-announcement-content">
            <div className="word-announcement-header">
              <h2>🎯 제시어</h2>
              <button 
                className="word-announcement-close"
                onClick={actions.toggleWordAnnouncement}
              >
                ✕
              </button>
            </div>
            <div className="word-announcement-topic">
              <span className="topic-label">주제:</span>
              <span className="topic-value">{gameStateData.topic}</span>
            </div>
            {currentPlayerFromContext?.role !== 'liar' ? (
              <>
                <div className="word-announcement-word">
                  <span className="word-label">단어:</span>
                  <span className="word-value">{gameStateData.word}</span>
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
          onStartFinalSpeech={actions.startFinalSpeech}
        />
      )}

      {/* 최후발언 공지 */}
      {gamePhase === 'final_speech' && (
        <FinalSpeechAnnouncement
          suspectedPlayer={suspectedPlayer}
          onCompleteSpeech={(speechText) => {
            // 최후발언 완료 처리 (필요시 설명 로그에 추가)
          }}
          onStartWithdrawal={actions.startWithdrawal}
        />
      )}

      <div className="game-content">
        <PageTransition transitionKey={currentPhase}>
          <LazyGamePhase
            phase={currentPhase}
            {...phaseProps}
          />
        </PageTransition>
      </div>

      {/* 채팅과 설명 기록을 가로로 배치 */}
      <div className="game-bottom-section">
        <Chat
          messages={chatMessages}
          onSendMessage={actions.addChatMessage}
          currentPlayer={currentPlayerFromContext}
          isVisible={isChatVisible}
          onToggleVisibility={actions.toggleChat}
          disabled={gamePhase === 'topic_selection' || gamePhase === 'role_confirmation' || gamePhase === 'result'}
          explanations={explanations}
          onAddExplanation={actions.addExplanation}
          currentSpeaker={currentSpeakerFromContext}
          allPlayers={gameStateData?.players || []}
          onAddExplanationAsPlayer={(playerId, explanationText) => {
            const player = gameStateData?.players.find(p => p.id === playerId);
            if (player) {
              actions.addExplanation(explanationText, player.name);
            }
          }}
          gamePhase={gamePhase}
          spectatorMode={false}
        />
      </div>
    </div>
  );
};

export default Game;