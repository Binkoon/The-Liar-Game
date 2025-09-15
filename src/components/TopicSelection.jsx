import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { GAME_TOPICS } from '../data/gameData';
import '../styles/TopicSelection.css';

const TopicSelection = ({ onTopicSelected, onBackToLobby, currentPlayer }) => {
  const [selectedTopic, setSelectedTopic] = useState('');


  const handleTopicSelect = (topic) => {
    // 방장만 주제를 선택할 수 있음
    if (!currentPlayer?.isHost) {
      return;
    }
    setSelectedTopic(topic);
  };

  const handleConfirm = () => {
    // 방장만 주제 선택을 완료할 수 있음
    if (!currentPlayer?.isHost || !selectedTopic) {
      return;
    }
    onTopicSelected(selectedTopic);
  };

  const handleRandom = () => {
    // 방장만 랜덤 선택을 할 수 있음
    if (!currentPlayer?.isHost) {
      return;
    }
    const topics = Object.keys(GAME_TOPICS);
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    onTopicSelected(randomTopic);
  };

  return (
    <div className="topic-selection">
      <Card title="주제 선택" className="topic-selection-card">
        <div className="topic-selection-content">
          <div className="selection-header">
            <h3>방장님, 게임 주제를 선택해주세요</h3>
            <p>선택한 주제에서 랜덤으로 단어가 선택됩니다.</p>
            {!currentPlayer?.isHost && (
              <div className="waiting-notice">
                <p>⏳ 방장이 주제를 선택할 때까지 기다려주세요...</p>
              </div>
            )}
          </div>

          <div className={`topics-grid ${!currentPlayer?.isHost ? 'topics-grid--disabled' : ''}`}>
            {Object.keys(GAME_TOPICS).map(topic => (
              <div
                key={topic}
                className={`topic-card ${selectedTopic === topic ? 'topic-card--selected' : ''} ${!currentPlayer?.isHost ? 'topic-card--disabled' : ''}`}
                onClick={() => handleTopicSelect(topic)}
              >
                <div className="topic-name">{topic}</div>
                <div className="topic-count">
                  {GAME_TOPICS[topic].length}개 단어
                </div>
              </div>
            ))}
          </div>

          <div className="selection-actions">
            <Button
              onClick={onBackToLobby}
              variant="secondary"
              size="large"
            >
              로비로 돌아가기
            </Button>
            {currentPlayer?.isHost && (
              <>
                <Button
                  onClick={handleRandom}
                  variant="outline"
                  size="large"
                >
                  랜덤 선택
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  size="large"
                  disabled={!selectedTopic}
                >
                  선택 완료
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TopicSelection;
