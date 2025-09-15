import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import Input from './Input';
import AnimatedCard from './AnimatedCard';
import PlayerCard from './PlayerCard';
import '../styles/Lobby.css';

const Lobby = ({ players, onRemovePlayer, onStartGame, roomCode, currentPlayer, onToggleSpectator }) => {

  console.log('Lobby 컴포넌트 렌더링:', {
    players: players,
    currentPlayer: currentPlayer,
    currentPlayerIsHost: currentPlayer?.isHost,
    currentPlayerName: currentPlayer?.name,
    playingCount: players.filter(p => p.status === 'playing').length
  });

  const canStartGame = players.filter(p => p.status === 'playing').length >= 3 && currentPlayer?.isHost;
  const playingPlayers = players.filter(p => p.status === 'playing');
  const spectatingPlayers = players.filter(p => p.status === 'spectating');

  console.log('게임 시작 가능 여부:', {
    canStartGame: canStartGame,
    playingCount: playingPlayers.length,
    isHost: currentPlayer?.isHost
  });

  return (
    <motion.div 
      className="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="lobby-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="lobby-title">라이어게임</h1>
        <p className="lobby-subtitle">
          최소 3명, 최대 10명까지 참여할 수 있습니다.
          {players.length >= 7 && (
            <motion.span 
              className="fanatic-notice"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <br />7명 이상일 때는 광신도가 추가됩니다!
            </motion.span>
          )}
        </p>
      </motion.div>

      <div className="lobby-content">

        {/* 참여자 목록 */}
        <AnimatedCard title={`참여자 (${playingPlayers.length}명)`} className="players-card" delay={0.4}>
          <motion.div 
            className="players-grid"
            layout
          >
            {playingPlayers.map((player, index) => {
              // player가 null이거나 undefined인 경우 건너뛰기
              if (!player) return null;
              
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1
                  }}
                >
                  <PlayerCard
                    player={player}
                    onClick={currentPlayer && currentPlayer.id === player.id ? () => onRemovePlayer(player.id) : undefined}
                    className={currentPlayer && currentPlayer.id === player.id ? "player-card--removable" : ""}
                    showHost={player.isHost}
                    showSpectatorToggle={currentPlayer && currentPlayer.id === player.id}
                    onToggleSpectator={onToggleSpectator}
                  />
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* 실시간 상태 표시 */}
          <div className="realtime-status">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>실시간 동기화 중</span>
            </div>
            <div className="player-count">
              총 {players.length}명 접속 (참여: {playingPlayers.length}명, 관전: {spectatingPlayers.length}명)
            </div>
          </div>
        </AnimatedCard>

        {/* 관전자 목록 */}
        {spectatingPlayers.length > 0 && (
          <AnimatedCard title={`관전자 (${spectatingPlayers.length}명)`} className="spectators-card" delay={0.5}>
            <motion.div 
              className="players-grid"
              layout
            >
              {spectatingPlayers.map((player, index) => {
                // player가 null이거나 undefined인 경우 건너뛰기
                if (!player) return null;
                
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1
                    }}
                  >
                    <PlayerCard
                      player={player}
                      onClick={currentPlayer && currentPlayer.id === player.id ? () => onRemovePlayer(player.id) : undefined}
                      className={`player-card--spectator ${currentPlayer && currentPlayer.id === player.id ? "player-card--removable" : ""}`}
                      showHost={player.isHost}
                      showSpectatorToggle={currentPlayer && currentPlayer.id === player.id}
                      onToggleSpectator={onToggleSpectator}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatedCard>
        )}

        <div className="lobby-actions">
          {currentPlayer?.isHost ? (
            <AnimatedButton
              onClick={onStartGame}
              disabled={!canStartGame}
              variant="primary"
              size="large"
              className="start-game-btn"
              delay={0.6}
              hoverScale={1.05}
            >
              게임 시작
            </AnimatedButton>
          ) : (
            <div className="host-notice">
              <p>호스트만 게임을 시작할 수 있습니다</p>
              <p className="host-info">방을 만든 사람이 호스트입니다</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Lobby;