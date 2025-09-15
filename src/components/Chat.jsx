import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
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
  onAddExplanationAsPlayer,
  gamePhase = 'explanation',
  spectatorMode = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 자동 스크롤 비활성화 (사용자 요청에 따라)
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // 플레이어가 이미 발언했는지 확인
  const hasPlayerSpoken = (playerId) => {
    return explanations.some(exp => exp.playerId === playerId);
  };

  // 현재 플레이어가 발언할 수 있는지 확인
  const canPlayerSpeak = () => {
    if (!currentPlayer || spectatorMode) return false;
    if (gamePhase !== 'explanation') return false;
    return !hasPlayerSpoken(currentPlayer.id);
  };

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (newMessage.trim() && !disabled && canPlayerSpeak()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, disabled, canPlayerSpeak, onSendMessage]);


  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

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
              placeholder={
                disabled 
                  ? "채팅이 비활성화되었습니다" 
                  : !canPlayerSpeak() 
                    ? "이미 발언하셨습니다" 
                    : gamePhase === 'explanation'
                      ? "제시어에 대한 설명을 입력하세요..."
                      : "메시지를 입력하세요..."
              }
              disabled={disabled || !canPlayerSpeak()}
              className="chat-input"
              maxLength={100}
            />
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={!newMessage.trim() || disabled || !canPlayerSpeak()}
              className="chat-send-btn"
            >
              전송
            </Button>
          </div>
          {gamePhase === 'explanation' && canPlayerSpeak() && (
            <div className="speaking-notice">
              💬 제시어에 대한 설명을 한 번만 할 수 있습니다
            </div>
          )}
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

export default memo(Chat);