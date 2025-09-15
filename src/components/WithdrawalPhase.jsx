import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/WithdrawalPhase.css';

const WithdrawalPhase = ({ gameState, onWithdrawVote, onCalculateResult, calculateVoteResult, currentPlayerId }) => {
  const [withdrawalDecisions, setWithdrawalDecisions] = useState({}); // 철회 결정 상태
  const [allDecisionsMade, setAllDecisionsMade] = useState(false);

  const voteResult = calculateVoteResult();
  const mostVotedPlayer = gameState.players.find(p => p.id === voteResult.mostVotedPlayer);

  const handleWithdrawDecision = (playerId, decision) => {
    if (playerId !== currentPlayerId) return; // 현재 플레이어만 결정할 수 있음
    
    setWithdrawalDecisions(prev => ({
      ...prev,
      [playerId]: decision
    }));
    
    if (decision === 'withdraw') {
      onWithdrawVote(playerId);
    }
  };

  const handleFinalize = () => {
    // 다수결로 철회 여부 결정
    const decisions = Object.values(withdrawalDecisions);
    const withdrawCount = decisions.filter(d => d === 'withdraw').length;
    const keepCount = decisions.filter(d => d === 'keep').length;
    
    if (withdrawCount > keepCount) {
      // 철회가 다수결로 결정됨 - 재투표
      console.log('철회가 다수결로 결정됨 - 재투표 진행');
      // 재투표 로직은 gameStore에서 처리
    } else {
      // 철회 안함이 다수결로 결정됨 - 최종 결과
      console.log('철회 안함이 다수결로 결정됨 - 최종 결과');
    }
    
    onCalculateResult();
  };

  // 모든 플레이어가 결정했는지 확인
  React.useEffect(() => {
    const votingPlayers = gameState.players.filter(p => gameState.votes[p.id]);
    const decidedPlayers = Object.keys(withdrawalDecisions);
    setAllDecisionsMade(decidedPlayers.length === votingPlayers.length);
  }, [withdrawalDecisions, gameState.players, gameState.votes]);

  const getVoteCounts = () => {
    const voteCounts = {};
    Object.values(gameState.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
    return voteCounts;
  };

  const voteCounts = getVoteCounts();
  const totalVotes = Object.keys(gameState.votes).length;
  const totalWithdrawals = Object.values(withdrawalDecisions).filter(d => d === 'withdraw').length;
  const votingPlayers = gameState.players.filter(p => gameState.votes[p.id]);

  return (
    <div className="withdrawal-phase">
      <Card title="철회 단계" className="withdrawal-card">
        <div className="withdrawal-content">
          <div className="withdrawal-instructions">
            <h3>투표 철회 기회</h3>
            <p>
              각 플레이어는 1회에 한해 투표를 철회할 수 있습니다. 
              철회할 플레이어는 아래에서 자신의 이름을 클릭하세요.
            </p>
          </div>

          <div className="voting-result">
            <h4>현재 투표 결과</h4>
            <div className="voted-player">
              <PlayerCard
                player={mostVotedPlayer}
                className="voted-player-card"
              />
              <div className="vote-info">
                <p className="vote-count">{voteCounts[mostVotedPlayer?.id] || 0}표</p>
                <p className="vote-message">
                  {mostVotedPlayer?.name}님이 가장 많이 지목되었습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="withdrawal-options">
            <h4>투표 철회 결정</h4>
            <p className="withdrawal-instruction">
              각 플레이어는 투표를 철회할지 결정해야 합니다. 다수결의 원칙에 따라 결정됩니다.
            </p>
            <div className="players-list">
              {votingPlayers.map(player => {
                // player가 null이거나 undefined인 경우 건너뛰기
                if (!player) return null;
                
                const decision = withdrawalDecisions[player.id];
                const isCurrentPlayer = player.id === currentPlayerId;

                return (
                  <div key={player.id} className="withdrawal-player">
                    <PlayerCard
                      player={player}
                      className={`withdrawal-player-card ${decision ? 'withdrawal-player-card--decided' : ''}`}
                    />
                    <div className="withdrawal-decision">
                      {!isCurrentPlayer ? (
                        <span className="waiting">
                          {decision ? (decision === 'withdraw' ? '철회' : '철회 안함') : '결정 대기 중...'}
                        </span>
                      ) : (
                        <div className="decision-buttons">
                          <Button
                            onClick={() => handleWithdrawDecision(player.id, 'withdraw')}
                            variant={decision === 'withdraw' ? 'primary' : 'secondary'}
                            size="small"
                            className={`decision-btn ${decision === 'withdraw' ? 'decision-btn--selected' : ''}`}
                          >
                            철회
                          </Button>
                          <Button
                            onClick={() => handleWithdrawDecision(player.id, 'keep')}
                            variant={decision === 'keep' ? 'primary' : 'secondary'}
                            size="small"
                            className={`decision-btn ${decision === 'keep' ? 'decision-btn--selected' : ''}`}
                          >
                            철회 안함
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="withdrawal-status">
            <div className="status-info">
              <p>총 투표: {totalVotes}명</p>
              <p>결정 완료: {Object.keys(withdrawalDecisions).length}명 / {votingPlayers.length}명</p>
              <p>철회: {totalWithdrawals}명, 철회 안함: {Object.values(withdrawalDecisions).filter(d => d === 'keep').length}명</p>
            </div>
          </div>

          <div className="withdrawal-actions">
            <Button
              onClick={handleFinalize}
              variant="primary"
              size="large"
              disabled={!allDecisionsMade}
            >
              {allDecisionsMade ? '최종 결과 확인' : '모든 플레이어의 결정을 기다리는 중...'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WithdrawalPhase;
