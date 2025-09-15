import React, { memo } from 'react';
import Card from './Card';
import '../styles/PlayerCard.css';

const PlayerCard = ({ 
  player, 
  isCurrentSpeaker = false, 
  isVoted = false, 
  isDead = false,
  hasSpoken = false,
  onClick,
  showRole = false,
  showHost = false,
  showSpectatorToggle = false,
  onToggleSpectator,
  className = ''
}) => {
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'civilian': return '일반인';
      case 'liar': return '라이어';
      case 'fanatic': return '광신도';
      default: return '알 수 없음';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'civilian': return '#4CAF50';
      case 'liar': return '#F44336';
      case 'fanatic': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const cardClasses = [
    'player-card',
    isCurrentSpeaker ? 'player-card--current' : '',
    isVoted ? 'player-card--voted' : '',
    hasSpoken ? 'player-card--voted' : '',
    isDead ? 'player-card--dead' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Card 
      className={cardClasses}
      onClick={onClick}
      clickable={!!onClick}
    >
      <div className="player-info">
        <div className="player-name">
          {player.name}
          {showHost && player.isHost && (
            <span className="host-badge">👑</span>
          )}
        </div>
        {showRole && (
          <div 
            className="player-role"
            style={{ color: getRoleColor(player.role) }}
          >
            {getRoleDisplayName(player.role)}
          </div>
        )}
        {isCurrentSpeaker && (
          <div className="speaker-indicator">●</div>
        )}
        {isVoted && (
          <div className="vote-indicator">✓</div>
        )}
        {isDead && (
          <div className="dead-indicator">💀</div>
        )}
        {showSpectatorToggle && (
          <button 
            className="spectator-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSpectator && onToggleSpectator(player.id);
            }}
            title={player.status === 'playing' ? '관전자 모드로 전환' : '참여자 모드로 전환'}
          >
            {player.status === 'playing' ? '👁️ 관전' : '🎮 참여'}
          </button>
        )}
      </div>
    </Card>
  );
};

export default memo(PlayerCard);
