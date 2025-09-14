import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import '../styles/ExplanationLog.css';

const ExplanationLog = ({ 
  explanations, 
  onAddExplanation, 
  currentPlayer, 
  currentSpeaker,
  isVisible, 
  onToggleVisibility,
  disabled = false,
  allPlayers = [], // 모든 플레이어 목록 추가
  onAddExplanationAsPlayer = null // 특정 플레이어로 설명 추가하는 함수
}) => {
  const [newExplanation, setNewExplanation] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const explanationsEndRef = useRef(null);

  const scrollToBottom = () => {
    explanationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [explanations]);

  const handleAddExplanation = (e) => {
    e.preventDefault();
    if (newExplanation.trim() && !disabled) {
      // 개발환경: 선택된 플레이어로 설명 추가
      if (onAddExplanationAsPlayer && selectedPlayerId) {
        onAddExplanationAsPlayer(selectedPlayerId, newExplanation.trim());
        setNewExplanation('');
      }
      // 일반환경: 현재 플레이어가 발언권이 있을 때만
      else if (currentPlayer && currentSpeaker && currentPlayer.id === currentSpeaker.id) {
        onAddExplanation(newExplanation.trim());
        setNewExplanation('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddExplanation(e);
    }
  };

  const isCurrentPlayerTurn = currentPlayer && currentSpeaker && currentPlayer.id === currentSpeaker.id;
  const canAddExplanation = !disabled && isCurrentPlayerTurn;

  if (!isVisible) {
    return (
      <div className="explanation-log-toggle">
        <Button
          onClick={onToggleVisibility}
          variant="outline"
          size="small"
          className="explanation-log-toggle-btn"
        >
          📝 설명 기록
        </Button>
      </div>
    );
  }

  return (
    <Card className="explanation-log-card" title="제시어 설명 기록">
      <div className="explanation-log-container">
        <div className="explanation-log-list">
          {explanations.length === 0 ? (
            <div className="no-explanations">
              <p>아직 설명이 없습니다.</p>
            </div>
          ) : (
            explanations.map((explanation, index) => (
              <div
                key={index}
                className="explanation-item"
              >
                <div className="explanation-number">{index + 1}.</div>
                <div className="explanation-content">
                  <div className="explanation-player">{explanation.playerName}:</div>
                  <div className="explanation-text">{explanation.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={explanationsEndRef} />
        </div>
        
        {isCurrentPlayerTurn && (
          <div className="current-speaker-notice">
            <p>● {currentSpeaker?.name}님의 차례입니다</p>
          </div>
        )}
        
        {/* 개발환경: 플레이어 선택 */}
        {onAddExplanationAsPlayer && allPlayers.length > 0 && (
          <div className="dev-player-selector">
            <label className="dev-label">🔧 개발모드: 플레이어 선택</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="dev-player-select"
            >
              <option value="">플레이어를 선택하세요</option>
              {allPlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.role === 'liar' ? '라이어' : player.role === 'fanatic' ? '광신도' : '일반인'})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <form onSubmit={handleAddExplanation} className="explanation-input-form">
          <div className="explanation-input-container">
            <Input
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                onAddExplanationAsPlayer && selectedPlayerId
                  ? `${allPlayers.find(p => p.id === selectedPlayerId)?.name || '선택된 플레이어'}님의 설명을 입력하세요...`
                  : !canAddExplanation 
                    ? (isCurrentPlayerTurn ? "설명을 입력하세요..." : `${currentSpeaker?.name || '다른 플레이어'}님의 차례입니다`)
                    : "제시어에 대한 설명을 입력하세요..."
              }
              disabled={!canAddExplanation && !(onAddExplanationAsPlayer && selectedPlayerId)}
              className="explanation-input"
              maxLength={200}
            />
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={!newExplanation.trim() || (!canAddExplanation && !(onAddExplanationAsPlayer && selectedPlayerId))}
              className="explanation-add-btn"
            >
              추가
            </Button>
          </div>
        </form>
        
        <div className="explanation-log-actions">
          <Button
            onClick={onToggleVisibility}
            variant="secondary"
            size="small"
            className="explanation-log-close-btn"
          >
            닫기
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ExplanationLog;
