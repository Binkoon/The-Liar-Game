import React, { useState, useEffect } from 'react';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/ExplanationPhase.css';

const ExplanationPhase = ({ gameState, currentPlayer, currentSpeaker, onNextSpeaker, onAddExplanation, onStartVoting }) => {
  const [explanation, setExplanation] = useState('');

  const isCurrentPlayerTurn = currentPlayer && currentSpeaker && currentPlayer.id === currentSpeaker.id;
  const hasSpoken = currentSpeaker ? currentSpeaker.hasSpoken : false;
  const allPlayersSpoken = gameState.players.every(p => p.hasSpoken);


  // 모든 플레이어가 발언을 완료하면 자동으로 투표 단계로 전환
  useEffect(() => {
    if (allPlayersSpoken && onStartVoting) {
      const timer = setTimeout(() => {
        onStartVoting();
      }, 2000); // 2초 후 자동 전환
      
      return () => clearTimeout(timer);
    }
  }, [allPlayersSpoken, onStartVoting]);

  // 설명 입력창 초기화
  useEffect(() => {
    if (isCurrentPlayerTurn && !hasSpoken) {
      setExplanation('');
    }
  }, [isCurrentPlayerTurn, hasSpoken]);

  const handleSubmitExplanation = () => {
    if (!explanation.trim()) {
      alert('설명을 입력해주세요.');
      return;
    }

    onNextSpeaker(explanation.trim());
    setExplanation('');
  };

  const handleSkip = () => {
    onNextSpeaker('(설명 없음)');
    setExplanation('');
  };

  const getPlayerInfo = (player) => {
    if (!player) {
      return {
        name: '알 수 없음',
        role: 'civilian',
        hasSpoken: false
      };
    }
    
    return {
      name: player.name || '알 수 없음',
      role: player.role || 'civilian',
      hasSpoken: player.hasSpoken || false
    };
  };

  return (
    <div className="explanation-phase">
      <div className="explanation-content">
        <div className="current-speaker">
          <h3>
            {allPlayersSpoken ? '설명 완료' : currentSpeaker ? `${currentSpeaker.name}님의 차례` : '설명 단계'}
          </h3>
          <p>제시어에 대한 설명을 해주세요. (라이어는 단어를 모르므로 유추해서 설명하세요)</p>
        </div>

        <div className="players-status">
          <h4>플레이어 상태</h4>
          <div className="players-grid">
            {gameState.players.map(player => {
              // player가 null이거나 undefined인 경우 건너뛰기
              if (!player) return null;
              
              const playerInfo = getPlayerInfo(player);
              const isCurrentSpeaker = player.id === currentSpeaker?.id;
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentSpeaker={isCurrentSpeaker}
                  hasSpoken={player.hasSpoken}
                  showRole={false}
                />
              );
            })}
          </div>
        </div>

        {isCurrentPlayerTurn && !hasSpoken && (
          <div className="explanation-input">
            <h4>당신의 설명</h4>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="제시어에 대한 설명을 입력하세요..."
              className="explanation-textarea"
              maxLength={200}
            />
            <div className="explanation-actions">
              <Button
                onClick={handleSkip}
                variant="secondary"
              >
                건너뛰기
              </Button>
              <Button
                onClick={handleSubmitExplanation}
                variant="primary"
                disabled={!explanation.trim()}
              >
                설명 완료
              </Button>
            </div>
          </div>
        )}

        {allPlayersSpoken ? (
          <div className="all-completed-message">
            <p>🎉 모든 플레이어의 설명이 완료되었습니다!</p>
            <p>2초 후 투표 단계로 자동 전환됩니다...</p>
            <div className="auto-transition-countdown">
              <div className="countdown-spinner"></div>
            </div>
          </div>
        ) : isCurrentPlayerTurn && hasSpoken ? (
          <div className="waiting-message">
            <p>다른 플레이어들의 설명을 기다리는 중...</p>
          </div>
        ) : !isCurrentPlayerTurn ? (
          <div className="waiting-message">
            <p>{currentSpeaker?.name}님의 설명을 기다리는 중...</p>
          </div>
        ) : null}

        <div className="explanation-progress">
          <div className="progress-info">
            <span>
              발언 완료: {gameState.players.filter(p => p.hasSpoken).length}명 / {gameState.players.length}명
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${(gameState.players.filter(p => p.hasSpoken).length / gameState.players.length) * 100}%` 
              }}
            />
          </div>
        </div>
        </div>
      </div>
    
  );
};

export default ExplanationPhase;
