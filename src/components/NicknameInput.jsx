import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import '../styles/NicknameInput.css';

const NicknameInput = ({ onJoin, roomCode, isHost = false, showRoomCode = true }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.trim().length < 2) {
      setError('닉네임은 2글자 이상이어야 합니다.');
      return;
    }

    if (nickname.trim().length > 10) {
      setError('닉네임은 10글자 이하여야 합니다.');
      return;
    }

    onJoin(nickname.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      className="nickname-input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="nickname-card">
        <div className="nickname-content">
          <div className="nickname-header">
            <h2 className="nickname-title">
              {isHost ? '방 만들기' : '방 참여하기'}
            </h2>
            <p className="nickname-subtitle">
              {isHost 
                ? '새로운 게임 방을 만들고 호스트가 되세요.'
                : showRoomCode 
                  ? `방 코드: ${roomCode}에 참여하세요.`
                  : '게임 방에 참여하세요.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="nickname-form">
            <div className="input-group">
              <label htmlFor="nickname" className="input-label">
                닉네임을 입력하세요
              </label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="닉네임을 입력하세요"
                className="nickname-input"
                maxLength={10}
                autoFocus
              />
              {error && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="join-btn"
              disabled={!nickname.trim()}
            >
              {isHost ? '방 만들기' : '방 참여하기'}
            </Button>
          </form>

          <div className="nickname-info">
            <div className="info-item">
              <span className="info-icon">👥</span>
              <span>최소 3명, 최대 10명까지 참여 가능</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🎮</span>
              <span>게임은 약 10-15분 소요</span>
            </div>
            {isHost && (
              <div className="info-item host-info">
                <span className="info-icon">👑</span>
                <span>방을 만든 사람이 호스트가 됩니다</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NicknameInput;
