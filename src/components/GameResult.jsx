import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import PlayerCard from './PlayerCard';
import Modal from './Modal';
import { ROLES } from '../data/gameData';
import '../styles/GameResult.css';

const GameResult = ({ gameState, onLiarAnswer, onBackToLobby, onNewGame, calculateVoteResult }) => {
  const [showLiarAnswerModal, setShowLiarAnswerModal] = useState(false);
  const [liarAnswer, setLiarAnswer] = useState('');
  const [liarAnswerResult, setLiarAnswerResult] = useState(null);

  const voteResult = calculateVoteResult();
  const mostVotedPlayer = gameState.players.find(p => p.id === voteResult.mostVotedPlayer);
  const isLiarCaught = mostVotedPlayer?.role === 'liar';

  // 승리자 계산 (규칙에 따른 정확한 승리 조건)
  const getWinners = () => {
    const winners = [];
    
    if (!mostVotedPlayer) return winners;
    
    // 라이어가 지목된 경우
    if (mostVotedPlayer.role === 'liar') {
      // 일반인 승리: 라이어 지목 성공
      gameState.players.forEach(player => {
        if (player.role === 'civilian') {
          winners.push({ ...player, reason: '라이어를 성공적으로 찾았습니다!' });
        }
      });
    }
    // 광신도가 지목된 경우
    else if (mostVotedPlayer.role === 'fanatic') {
      // 광신도 승리: 본인이 지목당함
      winners.push({ ...mostVotedPlayer, reason: '광신도로 지목되어 승리했습니다!' });
    }
    // 일반인이 지목된 경우
    else if (mostVotedPlayer.role === 'civilian') {
      // 라이어 승리: 일반인 지목 성공
      gameState.players.forEach(player => {
        if (player.role === 'liar') {
          winners.push({ ...player, reason: '일반인을 지목하여 승리했습니다!' });
        }
      });
    }
    
    return winners;
  };

  const winners = getWinners();

  // 역할 표시 함수들
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'civilian': return '일반인';
      case 'liar': return '라이어';
      case 'fanatic': return '광신도';
      default: return '알 수 없음';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'civilian': return '👤';
      case 'liar': return '🎭';
      case 'fanatic': return '🔥';
      default: return '❓';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'civilian': return '#3b82f6'; // 파란색
      case 'liar': return '#ef4444'; // 빨간색
      case 'fanatic': return '#f59e0b'; // 주황색
      default: return '#6b7280'; // 회색
    }
  };

  const handleLiarAnswerSubmit = () => {
    if (!liarAnswer.trim()) {
      alert('답을 입력해주세요.');
      return;
    }

    const isCorrect = onLiarAnswer(liarAnswer.trim());
    setLiarAnswerResult(isCorrect);
  };

  const getGameResultMessage = () => {
    if (!mostVotedPlayer) return '투표 결과가 없습니다.';

    switch (mostVotedPlayer.role) {
      case ROLES.LIAR:
        return '라이어가 지목되었습니다!';
      case ROLES.FANATIC:
        return '광신도가 지목되었습니다!';
      case ROLES.CIVILIAN:
        return '일반인이 지목되었습니다!';
      default:
        return '알 수 없는 결과입니다.';
    }
  };

  const getWinnerMessage = () => {
    if (!mostVotedPlayer) return '';

    switch (mostVotedPlayer.role) {
      case ROLES.LIAR:
        return '라이어가 지목되었으므로 일반인의 승리입니다!';
      case ROLES.FANATIC:
        return '광신도가 지목되었으므로 광신도의 승리입니다!';
      case ROLES.CIVILIAN:
        return '일반인이 지목되었으므로 라이어의 승리입니다!';
      default:
        return '';
    }
  };

  // 라이어 답변 결과에 따른 최종 승리자 재계산
  const getFinalWinners = () => {
    if (liarAnswerResult === null) return winners;
    
    // 라이어가 지목되었고 답변을 했을 때
    if (mostVotedPlayer?.role === 'liar') {
      if (liarAnswerResult) {
        // 라이어가 정답을 맞혔으면 라이어 승리
        return gameState.players.filter(p => p.role === 'liar').map(player => ({
          ...player,
          reason: '라이어가 제시어를 맞혀 승리했습니다!'
        }));
      } else {
        // 라이어가 틀렸으면 일반인 승리 (기존 winners 유지)
        return winners;
      }
    }
    
    return winners;
  };

  const finalWinners = getFinalWinners();


  return (
    <div className="game-result">
      <Card title="게임 결과" className="result-card">
        <div className="result-content">
          <div className="result-message">
            <h2 className="result-title">{getGameResultMessage()}</h2>
            <p className="winner-message">{getWinnerMessage()}</p>
          </div>

          {/* 승리자 표시 */}
          {finalWinners.length > 0 && (
            <div className="winners-section">
              <h3>🏆 승리자</h3>
              <div className="winners-list">
                {finalWinners.map((winner, index) => (
                  <div key={winner.id} className="winner-card">
                    <div className="winner-badge">
                      <span className="winner-icon">👑</span>
                      <span className="winner-rank">#{index + 1}</span>
                    </div>
                    <div className="winner-info">
                      <h4 className="winner-name">{winner.name}</h4>
                      <div className="winner-role">
                        <span className="role-badge" style={{ backgroundColor: getRoleColor(winner.role) }}>
                          {getRoleBadge(winner.role)} {getRoleDisplayName(winner.role)}
                        </span>
                      </div>
                      <p className="winner-reason">{winner.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="voted-player-result">
            <h3>지목된 플레이어</h3>
            <div className="player-result">
              <PlayerCard
                player={mostVotedPlayer}
                showRole={true}
                className="result-player-card"
              />
              <div className="player-role-info">
                <div className="role-badge" style={{ backgroundColor: getRoleColor(mostVotedPlayer?.role) }}>
                  {getRoleBadge(mostVotedPlayer?.role)} {getRoleDisplayName(mostVotedPlayer?.role)}
                </div>
                <p className="vote-count">{voteResult.voteCounts[mostVotedPlayer?.id] || 0}표</p>
              </div>
            </div>
          </div>

          {/* 모든 플레이어 직업 공개 */}
          <div className="all-players-roles">
            <h3>🎭 모든 플레이어의 직업</h3>
            <div className="players-roles-grid">
              {gameState.players.map((player, index) => {
                const isWinner = finalWinners.some(w => w.id === player.id);
                return (
                  <div key={player.id} className={`player-role-card ${isWinner ? 'winner' : ''}`}>
                    <div className="player-role-header">
                      <h4 className="player-name">{player.name}</h4>
                      {isWinner && <span className="winner-crown">👑</span>}
                    </div>
                    <div className="player-role-badge" style={{ backgroundColor: getRoleColor(player.role) }}>
                      {getRoleBadge(player.role)} {getRoleDisplayName(player.role)}
                    </div>
                    {isWinner && (
                      <p className="winner-reason-small">{finalWinners.find(w => w.id === player.id)?.reason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="game-info">
            <div className="topic-info">
              <h4>게임 정보</h4>
              <p><strong>주제:</strong> {gameState.topic}</p>
              <p><strong>정답 단어:</strong> <span className="answer-word">{gameState.word}</span></p>
            </div>
          </div>

          {isLiarCaught && (
            <div className="liar-answer-section">
              <h3>라이어 답변</h3>
              <p>라이어가 지목되었습니다. 제시어를 맞혀보세요!</p>
              <Button
                onClick={() => setShowLiarAnswerModal(true)}
                variant="warning"
                size="large"
              >
                답변하기
              </Button>
            </div>
          )}

          <div className="result-actions">
            <Button
              onClick={onNewGame}
              variant="primary"
              size="large"
            >
              새 게임
            </Button>
            <Button
              onClick={onBackToLobby}
              variant="secondary"
              size="large"
            >
              로비로 돌아가기
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showLiarAnswerModal}
        onClose={() => setShowLiarAnswerModal(false)}
        title="라이어 답변"
        showCloseButton={false}
      >
        <div className="liar-answer-modal">
          {liarAnswerResult === null ? (
            <div className="answer-input">
              <p>제시어를 맞혀보세요!</p>
              <input
                type="text"
                value={liarAnswer}
                onChange={(e) => setLiarAnswer(e.target.value)}
                placeholder="제시어를 입력하세요"
                className="answer-input-field"
                onKeyPress={(e) => e.key === 'Enter' && handleLiarAnswerSubmit()}
              />
              <div className="answer-actions">
                <Button
                  onClick={handleLiarAnswerSubmit}
                  variant="primary"
                  disabled={!liarAnswer.trim()}
                >
                  답변 제출
                </Button>
              </div>
            </div>
          ) : (
            <div className="answer-result">
              <div className={`result-message ${liarAnswerResult ? 'correct' : 'incorrect'}`}>
                <h3>{liarAnswerResult ? '정답입니다!' : '틀렸습니다!'}</h3>
                <p>
                  {liarAnswerResult 
                    ? '라이어가 제시어를 맞혔으므로 라이어의 승리입니다!'
                    : '라이어가 제시어를 맞히지 못했으므로 일반인의 승리입니다!'
                  }
                </p>
                <p><strong>정답:</strong> {gameState.word}</p>
              </div>
              <Button
                onClick={() => setShowLiarAnswerModal(false)}
                variant="primary"
              >
                확인
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GameResult;
