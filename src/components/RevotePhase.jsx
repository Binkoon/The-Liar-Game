import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/RevotePhase.css';

const RevotePhase = ({ 
  gameState, 
  currentPlayerId, 
  currentPlayer, 
  onVote, 
  onStartFinalSpeech 
}) => {
  const players = gameState?.players || [];
  const votes = gameState?.votes || {};

  const handleVote = (targetId) => {
    if (currentPlayerId && targetId !== currentPlayerId) {
      onVote(currentPlayerId, targetId);
    }
  };

  const getVoteCount = (playerId) => {
    return Object.values(votes).filter(vote => vote === playerId).length;
  };

  const hasVoted = currentPlayerId && votes[currentPlayerId];

  return (
    <motion.div
      className="revote-phase"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card title="재투표" className="revote-card">
        <div className="revote-content">
          <div className="revote-header">
            <h2>🔄 재투표</h2>
            <p>최다 득표자가 2명 이상이어서 재투표를 진행합니다.</p>
            <p className="revote-notice">
              이번에는 반드시 1명이 선택되어야 합니다.
            </p>
          </div>

          <div className="revote-players">
            <h3>누구를 의심하시나요?</h3>
            <div className="players-grid">
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  className={`player-vote-card ${hasVoted === player.id ? 'voted' : ''} ${hasVoted && hasVoted !== player.id ? 'disabled' : ''}`}
                  onClick={() => !hasVoted && handleVote(player.id)}
                  whileHover={!hasVoted ? { scale: 1.05 } : {}}
                  whileTap={!hasVoted ? { scale: 0.95 } : {}}
                >
                  <PlayerCard
                    player={player}
                    showHost={player.isHost}
                    className="vote-player-card"
                  />
                  <div className="vote-count">
                    {getVoteCount(player.id)}표
                  </div>
                  {hasVoted === player.id && (
                    <div className="vote-indicator">
                      ✓ 선택됨
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="revote-status">
            <p>
              투표 완료: {Object.keys(votes).length}명 / {players.length}명
            </p>
            {Object.keys(votes).length === players.length && (
              <motion.div
                className="revote-complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p>모든 플레이어가 투표했습니다!</p>
                <Button
                  onClick={onStartFinalSpeech}
                  variant="primary"
                  size="large"
                >
                  결과 확인
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RevotePhase;
