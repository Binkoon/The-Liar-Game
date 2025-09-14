import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import '../styles/Chat.css';

const Chat = ({ 
  messages, 
  onSendMessage, 
  currentPlayer, 
  isVisible, 
  onToggleVisibility,
  disabled = false,
  explanations = [],
  onAddExplanation,
  currentSpeaker,
  allPlayers = [],
  onAddExplanationAsPlayer
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [devExplanation, setDevExplanation] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && !disabled) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleDevExplanationAdd = () => {
    if (devExplanation.trim() && selectedPlayerId && onAddExplanationAsPlayer) {
      onAddExplanationAsPlayer(selectedPlayerId, devExplanation.trim());
      setDevExplanation('');
      setSelectedPlayerId('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isVisible) {
    return (
      <div className="chat-toggle">
        <Button
          onClick={onToggleVisibility}
          variant="secondary"
          size="small"
          className="chat-toggle-btn"
        >
          💬 채팅
        </Button>
      </div>
    );
  }

  return (
    <Card className="chat-card" title="게임 채팅 & 설명 기록">
      <div className="chat-container">
        {/* 설명 기록 섹션 */}
        <div className="explanations-section">
          <h4>📝 제시어 설명 기록</h4>
          <div className="explanations-list">
            {explanations.length === 0 ? (
              <p className="no-explanations">아직 설명이 없습니다.</p>
            ) : (
              explanations.map((explanation, index) => (
                <div key={index} className="explanation-item">
                  <div className="explanation-player">{explanation.playerName}</div>
                  <div className="explanation-text">{explanation.text}</div>
                </div>
              ))
            )}
          </div>
          
          {/* 개발모드: 설명 추가 */}
          {process.env.NODE_ENV === 'development' && onAddExplanationAsPlayer && allPlayers.length > 0 && (
            <div className="dev-explanation-section">
              <label className="dev-label">🔧 개발모드: 설명 추가</label>
              <div className="dev-explanation-form">
                <select 
                  className="dev-player-select"
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                >
                  <option value="">플레이어를 선택하세요</option>
                  {allPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <div className="dev-explanation-input">
                  <input
                    type="text"
                    placeholder="제시어에 대한 설명을 입력하세요..."
                    value={devExplanation}
                    onChange={(e) => setDevExplanation(e.target.value)}
                    className="dev-explanation-text"
                  />
                  <Button
                    onClick={handleDevExplanationAdd}
                    variant="primary"
                    size="small"
                    className="dev-explanation-btn"
                  >
                    추가
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>아직 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`message ${message.playerId === currentPlayer?.id ? 'own-message' : 'other-message'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="message-header">
                  <span className="message-player">{message.playerName}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="message-content">{message.text}</div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-container">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "채팅이 비활성화되었습니다" : "메시지를 입력하세요..."}
              disabled={disabled}
              className="chat-input"
              maxLength={100}
            />
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={!newMessage.trim() || disabled}
              className="chat-send-btn"
            >
              전송
            </Button>
          </div>
        </form>
        
        <div className="chat-actions">
          <Button
            onClick={onToggleVisibility}
            variant="secondary"
            size="small"
            className="chat-close-btn"
          >
            닫기
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Chat;