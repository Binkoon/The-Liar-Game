import React from 'react';
import Button from './Button';
import '../styles/SuspicionAnnouncement.css';

const SuspicionAnnouncement = ({ suspectedPlayer, onStartFinalSpeech }) => {
  if (!suspectedPlayer) return null;

  return (
    <div className="suspicion-announcement">
      <div className="suspicion-content">
        <div className="suspicion-header">
          <h2>🚨 의심받는 플레이어</h2>
        </div>
        
        <div className="suspicion-player">
          <div className="suspicion-player-name">
            {suspectedPlayer.name}님
          </div>
          <div className="suspicion-player-role">
            라이어로 의심받고 있습니다
          </div>
        </div>

        <div className="suspicion-message">
          <p>이제 {suspectedPlayer.name}님께 최후 발언 기회를 드립니다.</p>
          <p>채팅방에서 자신을 변호할 수 있습니다.</p>
        </div>

        <div className="suspicion-actions">
          <Button
            onClick={onStartFinalSpeech}
            variant="primary"
            size="large"
            className="start-final-speech-btn"
          >
            최후 발언 시작
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuspicionAnnouncement;
