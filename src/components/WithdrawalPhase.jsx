import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import PlayerCard from './PlayerCard';
import '../styles/WithdrawalPhase.css';

const WithdrawalPhase = ({ gameState, onWithdrawVote, onCalculateResult, calculateVoteResult }) => {
  const [withdrawnPlayers, setWithdrawnPlayers] = useState(new Set());
  const [withdrawalDecisions, setWithdrawalDecisions] = useState({}); // 철회 결정 상태

  const voteResult = calculateVoteResult();
  const mostVotedPlayer = gameState.players.find(p => p.id === voteResult.mostVotedPlayer);

  const handleWithdrawDecision = (playerId, decision) => {
    setWithdrawalDecisions(prev => ({
      ...prev,
      [playerId]: decision
    }));
    
    if (decision === 'withdraw') {
      onWithdrawVote(playerId);
      setWithdrawnPlayers(prev => new Set([...prev, playerId]));
    }
  };

  const handleFinalize = () => {
    onCalculateResult();
  };

  const getVoteCounts = () => {
    const voteCounts = {};
    Object.values(gameState.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
    return voteCounts;
  };

  const voteCounts = getVoteCounts();
  const totalVotes = Object.keys(gameState.votes).length;
  const totalWithdrawals = withdrawnPlayers.size;

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
              각 플레이어는 투표를 철회할지 결정해야 합니다. 철회하지 않으면 현재 투표가 유지됩니다.
            </p>
            <div className="players-list">
              {gameState.players.map(player => {
                const hasVoted = gameState.votes[player.id];
                const hasWithdrawn = withdrawnPlayers.has(player.id);
                const decision = withdrawalDecisions[player.id];
                const canDecide = hasVoted && !hasWithdrawn;

                return (
                  <div key={player.id} className="withdrawal-player">
                    <PlayerCard
                      player={player}
                      className={`withdrawal-player-card ${hasWithdrawn ? 'withdrawal-player-card--withdrawn' : ''}`}
                    />
                    <div className="withdrawal-decision">
                      {!hasVoted ? (
                        <span className="no-vote">투표 안함</span>
                      ) : hasWithdrawn ? (
                        <span className="withdrawn">철회 완료</span>
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
              <p>철회 완료: {totalWithdrawals}명</p>
            </div>
          </div>

          <div className="withdrawal-actions">
            <Button
              onClick={handleFinalize}
              variant="primary"
              size="large"
            >
              최종 결과 확인
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WithdrawalPhase;
