import React, { useState, useEffect } from 'react';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/VotingPhase.css';

const VotingPhase = ({ gameState, currentPlayer, onVote, onStartFinalSpeech }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const hasVoted = currentPlayer ? gameState.votes[currentPlayer.id] !== undefined : false;

  const handleVote = () => {
    if (hasVoted || !currentPlayer || !selectedPlayerId) return;
    
    onVote(currentPlayer.id, selectedPlayerId);
    setSelectedPlayerId('');
  };


  const handleStartFinalSpeech = () => {
    onStartFinalSpeech();
  };

  const getVoteCounts = () => {
    const voteCounts = {};
    Object.values(gameState.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
    return voteCounts;
  };

  const voteCounts = getVoteCounts();
  const totalVotes = Object.keys(gameState.votes).length;
  const totalPlayers = gameState.players.length;

  return (
    <div className="voting-phase">
      <div className="voting-content">
        <div className="voting-instructions">
          <h3>비밀투표</h3>
          <p>라이어로 의심되는 사람을 선택하세요. 다른 플레이어들은 누구에게 투표했는지 알 수 없습니다.</p>
        </div>

        {!hasVoted ? (
          <div className="secret-voting">
            <div className="voting-form">
              <label htmlFor="player-select" className="voting-label">
                투표할 플레이어를 선택하세요:
              </label>
              <select
                id="player-select"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="voting-select"
              >
                <option value="">플레이어를 선택하세요</option>
                {gameState.players
                  .filter(player => player && player.id !== currentPlayer?.id) // null 체크 및 자기 자신 제외
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name || '알 수 없음'}
                    </option>
                  ))}
              </select>
              <Button
                onClick={handleVote}
                variant="primary"
                size="large"
                disabled={!selectedPlayerId}
                className="vote-submit-btn"
              >
                투표하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="voted-confirmation">
            <p>✅ 투표가 완료되었습니다.</p>
            <p>다른 플레이어들의 투표를 기다리는 중...</p>
          </div>
        )}

        <div className="players-status">
          <h4>플레이어 상태</h4>
          <div className="players-grid">
            {gameState.players.map(player => {
              // player가 null이거나 undefined인 경우 건너뛰기
              if (!player) return null;
              
              const hasPlayerVoted = gameState.votes[player.id] !== undefined;
              return (
                <div key={player.id} className="voting-player-container">
                  <PlayerCard
                    player={player}
                    className={`voting-player ${hasPlayerVoted ? 'voting-player--voted' : ''}`}
                  />
                  {hasPlayerVoted && (
                    <div className="vote-status">
                      투표 완료
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


          <div className="voting-status">
            <div className="voting-progress">
              <span>투표 완료: {totalVotes} / {totalPlayers}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(totalVotes / totalPlayers) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {totalVotes === totalPlayers && (
            <div className="voting-actions">
              <Button
                onClick={handleStartFinalSpeech}
                variant="primary"
                size="large"
              >
                최후 발언 단계로
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="voted-message">
              <p>투표가 완료되었습니다. 다른 플레이어들의 투표를 기다리는 중...</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default VotingPhase;
