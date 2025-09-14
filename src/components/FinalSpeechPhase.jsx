import React, { useState, useEffect } from 'react';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/FinalSpeechPhase.css';

const FinalSpeechPhase = ({ gameState, currentPlayer, suspectedPlayer, onStartWithdrawal, onCalculateResult, calculateVoteResult }) => {
  const [hasGivenSpeech, setHasGivenSpeech] = useState(false);

  const isCurrentPlayer = currentPlayer && suspectedPlayer && currentPlayer.id === suspectedPlayer.id;

  const handleCompleteSpeech = () => {
    setHasGivenSpeech(true);
    onStartWithdrawal();
  };

  const voteResult = calculateVoteResult();
  const voteCount = voteResult.voteCounts[suspectedPlayer?.id] || 0;

  return (
    <div className="final-speech-phase">
      <div className="final-speech-content">
        <div className="voting-result">
          <h3>투표 결과</h3>
          <div className="voted-player">
            <PlayerCard
              player={suspectedPlayer}
              className="voted-player-card"
            />
            <div className="vote-info">
              <p className="vote-count">{voteCount}표</p>
              <p className="vote-message">
                {suspectedPlayer?.name}님이 가장 많이 지목되었습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="final-speech-section">
          <h3>
            {isCurrentPlayer ? '당신의 최후 발언' : `${suspectedPlayer?.name}님의 최후 발언`}
          </h3>
          <p>
            {isCurrentPlayer 
              ? '채팅방에서 자신을 변호할 수 있습니다. 최후 발언을 완료하면 철회 단계로 넘어갑니다.'
              : `${suspectedPlayer?.name}님이 채팅방에서 최후 발언을 하고 있습니다.`
            }
          </p>

          {isCurrentPlayer && !hasGivenSpeech && (
            <div className="speech-instructions">
              <p>💬 채팅방에서 자신을 변호해주세요.</p>
              <p>최후 발언이 끝나면 아래 버튼을 눌러주세요.</p>
              <Button
                onClick={handleCompleteSpeech}
                variant="primary"
                size="large"
                className="complete-speech-btn"
              >
                최후 발언 완료
              </Button>
            </div>
          )}

          {isCurrentPlayer && hasGivenSpeech && (
            <div className="speech-completed">
              <p>✅ 최후 발언이 완료되었습니다.</p>
            </div>
          )}

          {!isCurrentPlayer && (
            <div className="waiting-message">
              <p>💬 {suspectedPlayer?.name}님이 채팅방에서 최후 발언을 하고 있습니다...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalSpeechPhase;
