import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import '../styles/RoleAssignment.css';

const RoleAssignment = ({ gameState, currentPlayerId, onComplete, onConfirmRole, onForceConfirmAll }) => {
  const [showModal, setShowModal] = useState(false);

  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  
  const playerInfo = currentPlayer ? {
    id: currentPlayer.id,
    name: currentPlayer.name,
    role: currentPlayer.role,
    topic: gameState.topic,
    word: currentPlayer.role !== 'liar' ? gameState.word : null
  } : null;
  

  const handleShowRole = () => {
    // 역할이 배정되지 않았으면 모달을 열지 않음
    if (!currentPlayer?.role) {
      alert('아직 역할이 배정되지 않았습니다. 잠시만 기다려주세요.');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmRole = () => {
    if (currentPlayer) {
      onConfirmRole(currentPlayer.id);
    }
    setShowModal(false);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'civilian': return '일반인';
      case 'liar': return '라이어';
      case 'fanatic': return '광신도';
      case null:
      case undefined:
      default: return '역할 배정 중...';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'civilian':
        return '주제와 단어를 모두 알고 있습니다. 라이어를 찾아 투표로 제거해야 합니다.';
      case 'liar':
        return '주제만 알고 있습니다. 단어를 유추하여 맞혀야 합니다.';
      case 'fanatic':
        return '주제와 단어를 모두 알고 있습니다. 본인이 라이어로 지목당해야 합니다.';
      default:
        return '';
    }
  };

  const getWinCondition = (role) => {
    switch (role) {
      case 'civilian':
        return '라이어를 찾아 죽여야 함';
      case 'liar':
        return '일반인이 라이어로 지목되어 죽거나, 본인이 라이어로 지목되어도 제시어를 맞히면 살아남음';
      case 'fanatic':
        return '본인이 라이어로 지목당해야 함';
      default:
        return '';
    }
  };

  const confirmedCount = gameState.players.filter(p => p.roleConfirmed).length;
  const totalPlayers = gameState.players.length;
  const allConfirmed = gameState.players.every(p => p.roleConfirmed);

  return (
    <div className="role-assignment">
      <Card title="역할 확인" className="role-assignment-card">
        <div className="role-assignment-content">
          <div className="role-confirmation-header">
            <h3>모든 플레이어가 역할을 확인해주세요</h3>
            <p>각자 자신의 역할을 확인하고 "확인 완료" 버튼을 눌러주세요.</p>
          </div>

          <div className="confirmation-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(confirmedCount / totalPlayers) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              {confirmedCount} / {totalPlayers} 명 확인 완료
            </p>
          </div>

          <div className="players-status">
            <h4>플레이어 확인 상태</h4>
            <div className="players-list">
              {gameState.players.map(player => (
                <div key={player.id} className={`player-status ${player.roleConfirmed ? 'confirmed' : 'pending'}`}>
                  <span className="player-name">{player.name}</span>
                  <span className="confirmation-status">
                    {player.roleConfirmed ? '✅ 확인 완료' : '⏳ 대기 중'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!currentPlayer?.roleConfirmed && (
            <div className="role-confirmation-actions">
              <Button
                onClick={handleShowRole}
                variant="primary"
                size="large"
                className="show-role-btn"
                disabled={!currentPlayer?.role}
              >
                {currentPlayer?.role ? '내 역할 확인하기' : '역할 배정 중...'}
              </Button>
            </div>
          )}

          {currentPlayer?.roleConfirmed && (
            <div className="role-confirmed-message">
              <p>✅ 역할 확인이 완료되었습니다!</p>
              <p>다른 플레이어들이 모두 확인할 때까지 기다려주세요.</p>
            </div>
          )}

          {allConfirmed && (
            <div className="all-confirmed-message">
              <p>🎉 모든 플레이어가 역할 확인을 완료했습니다!</p>
              <Button
                onClick={onComplete}
                variant="primary"
                size="large"
                className="start-game-btn"
              >
                게임 시작하기
              </Button>
            </div>
          )}

          {/* 개발/테스트용 강제 확인 버튼 */}
          {!allConfirmed && (
            <div className="dev-tools">
              <div className="dev-notice">
                <p>🔧 개발 모드: 테스트용 강제 확인 버튼</p>
              </div>
              <Button
                onClick={onForceConfirmAll}
                variant="secondary"
                size="medium"
                className="force-confirm-btn"
              >
                모든 플레이어 강제 확인 (테스트용)
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="당신의 역할"
        className="role-modal"
      >
        {playerInfo && (
          <div className="role-info">
            <div className="role-header">
              <h2 className="role-name">{getRoleDisplayName(playerInfo.role)}</h2>
              <div className="role-badge">
                {playerInfo.role === 'liar' ? '🎭' : playerInfo.role === 'fanatic' ? '🔥' : '👤'}
              </div>
            </div>

            <div className="role-details">
              <div className="topic-info">
                <h3>주제</h3>
                <p className="topic-text">{playerInfo.topic}</p>
              </div>

              {playerInfo.word && (
                <div className="word-info">
                  <h3>단어</h3>
                  <p className="word-text">{playerInfo.word}</p>
                </div>
              )}

              {!playerInfo.word && (
                <div className="liar-info">
                  <h3>라이어 정보</h3>
                  <p className="liar-text">
                    당신은 라이어입니다. 단어를 유추하여 맞혀야 합니다.
                  </p>
                </div>
              )}

              <div className="role-description">
                <h3>역할 설명</h3>
                <p>{getRoleDescription(playerInfo.role)}</p>
              </div>

              <div className="win-condition">
                <h3>승리 조건</h3>
                <p>{getWinCondition(playerInfo.role)}</p>
              </div>
            </div>

            <div className="role-modal-actions">
              <Button
                onClick={handleConfirmRole}
                variant="primary"
                size="large"
                className="confirm-role-btn"
              >
                확인 완료
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoleAssignment;