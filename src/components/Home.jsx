import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import AnimatedCard from './AnimatedCard';
import '../styles/Home.css';

const Home = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError('방 코드를 입력해주세요.');
      return;
    }
    
    if (roomCode.trim().length < 6) {
      setError('올바른 방 코드를 입력해주세요.');
      return;
    }
    
    onJoinRoom(roomCode.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <motion.div 
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="home-title">라이어게임</h1>
        <p className="home-subtitle">
          최소 3명, 최대 10명까지 참여할 수 있습니다.
        </p>
      </motion.div>

      <div className="home-content">
        {/* 방 만들기 카드 */}
        <AnimatedCard className="action-card" delay={0.2}>
          <div className="action-content">
            <div className="action-icon">🏠</div>
            <h3 className="action-title">방 만들기</h3>
            <p className="action-description">
              새로운 게임 방을 만들고 호스트가 되세요.
            </p>
            <AnimatedButton
              onClick={onCreateRoom}
              variant="primary"
              size="large"
              className="action-button"
              delay={0.3}
            >
              방 만들기
            </AnimatedButton>
          </div>
        </AnimatedCard>

        {/* 방 참여하기 카드 */}
        <AnimatedCard className="action-card" delay={0.4}>
          <div className="action-content">
            <div className="action-icon">🚪</div>
            <h3 className="action-title">방 참여하기</h3>
            <p className="action-description">
              기존 방의 코드를 입력하여 참여하세요.
            </p>
            <div className="join-form">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="방 코드를 입력하세요"
                className="room-code-input"
                maxLength={10}
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
              <AnimatedButton
                onClick={handleJoinRoom}
                variant="secondary"
                size="large"
                className="action-button"
                delay={0.5}
                disabled={!roomCode.trim()}
              >
                방 참여하기
              </AnimatedButton>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* 게임 정보 */}
      <motion.div 
        className="game-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="info-item">
          <span className="info-icon">👥</span>
          <span>최소 3명, 최대 10명까지 참여 가능</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🎮</span>
          <span>게임은 약 10-15분 소요</span>
        </div>
        <div className="info-item">
          <span className="info-icon">👑</span>
          <span>방을 만든 사람이 호스트가 됩니다</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
