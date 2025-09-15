import React, { Suspense, lazy, memo } from 'react';
import { motion } from 'framer-motion';

// 게임 단계별 컴포넌트들을 lazy loading으로 import
const TopicSelection = lazy(() => import('./TopicSelection'));
const RoleAssignment = lazy(() => import('./RoleAssignment'));
const ExplanationPhase = lazy(() => import('./ExplanationPhase'));
const VotingPhase = lazy(() => import('./VotingPhase'));
const RevotePhase = lazy(() => import('./RevotePhase'));
const WithdrawalPhase = lazy(() => import('./WithdrawalPhase'));
const GameResult = lazy(() => import('./GameResult'));

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="game-loading"
  >
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>게임을 준비하는 중...</p>
    </div>
  </motion.div>
);

const LazyGamePhase = ({ phase, spectatorMode = false, ...props }) => {
  const renderPhase = () => {
    switch (phase) {
      case 'topic_selection':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TopicSelection {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'role_confirmation':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RoleAssignment {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'explanation':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ExplanationPhase {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'voting':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <VotingPhase {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'revote':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RevotePhase {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'withdrawal':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <WithdrawalPhase {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      case 'result':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GameResult {...props} spectatorMode={spectatorMode} />
          </Suspense>
        );
      default:
        return (
          <div className="game-waiting">
            <h2>게임을 시작하는 중...</h2>
          </div>
        );
    }
  };

  return renderPhase();
};

export default memo(LazyGamePhase);
