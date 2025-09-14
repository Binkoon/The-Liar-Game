import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import '../styles/FinalSpeechAnnouncement.css';

const FinalSpeechAnnouncement = ({ 
  suspectedPlayer, 
  onCompleteSpeech, 
  onStartWithdrawal 
}) => {
  const [speechText, setSpeechText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechComplete, setSpeechComplete] = useState(false);

  const handleStartSpeech = () => {
    if (!speechText.trim()) {
      alert('최후발언을 입력해주세요.');
      return;
    }
    setIsSpeaking(true);
  };

  const handleCompleteSpeech = () => {
    setSpeechComplete(true);
    setIsSpeaking(false);
    onCompleteSpeech(speechText.trim());
  };

  const handleStartWithdrawal = () => {
    onStartWithdrawal();
  };

  return (
    <motion.div 
      className="final-speech-announcement"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <div className="announcement-container">
        <div className="announcement-header">
          <div className="megaphone-icon">📢</div>
          <h2>최후발언 기회</h2>
        </div>
        
        <div className="suspected-player-info">
          <div className="player-name">{suspectedPlayer?.name}님</div>
          <div className="speech-label">라이어로 의심받고 있습니다</div>
        </div>

        {!speechComplete ? (
          <div className="speech-section">
            {!isSpeaking ? (
              <div className="speech-input">
                <h3>자신을 변호할 기회입니다</h3>
                <p>다른 플레이어들에게 당신이 라이어가 아님을 증명해보세요!</p>
                <textarea
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder="최후발언을 입력하세요..."
                  className="speech-textarea"
                  maxLength={500}
                />
                <div className="speech-actions">
                  <Button
                    onClick={handleStartSpeech}
                    variant="primary"
                    disabled={!speechText.trim()}
                    className="start-speech-btn"
                  >
                    🎤 발언 시작하기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="speech-display">
                <div className="speaking-indicator">
                  <div className="pulse-dot"></div>
                  <span>{suspectedPlayer?.name}님이 발언 중입니다...</span>
                </div>
                <div className="speech-content">
                  "{speechText}"
                </div>
                <div className="speech-actions">
                  <Button
                    onClick={handleCompleteSpeech}
                    variant="primary"
                    className="complete-speech-btn"
                  >
                    ✅ 발언 완료
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="speech-complete">
            <div className="complete-message">
              <h3>🎭 최후발언이 완료되었습니다!</h3>
              <div className="speech-summary">
                <strong>{suspectedPlayer?.name}님의 발언:</strong>
                <p>"{speechText}"</p>
              </div>
            </div>
            
            <div className="next-phase-actions">
              <h4>이제 다른 플레이어들이 투표를 철회할지 결정합니다</h4>
              <div className="action-buttons">
                <Button
                  onClick={handleStartWithdrawal}
                  variant="primary"
                  className="start-withdrawal-btn"
                >
                  🔄 철회 단계 시작
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FinalSpeechAnnouncement;
