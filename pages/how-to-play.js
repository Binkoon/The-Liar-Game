import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function HowToPlay() {
  return (
    <>
      <Head>
        <title>게임 방법 - 라이어 게임</title>
        <meta name="description" content="라이어 게임의 자세한 게임 방법과 규칙을 알아보세요" />
      </Head>

      <div className="container">
        <div className="how-to-play-page">
          <div className="header">
            <h1>🎭 라이어 게임 방법</h1>
            <p>친구들과 함께 즐기는 온라인 추리 게임의 모든 것을 알아보세요!</p>
          </div>

          <div className="content-grid">
            {/* 기본 정보 */}
            <Card title="🎯 게임 목표" className="info-card">
              <div className="card-content">
                <p>한 명의 <strong>라이어</strong>를 찾아내거나, 라이어가 모든 라운드를 통과하는 게임입니다.</p>
                <ul>
                  <li><strong>일반인 팀 승리:</strong> 라이어를 찾아내기</li>
                  <li><strong>라이어 승리:</strong> 모든 라운드를 통과하기</li>
                </ul>
              </div>
            </Card>

            {/* 역할 설명 */}
            <Card title="👥 플레이어 역할" className="roles-card">
              <div className="card-content">
                <div className="role-item">
                  <h4>👤 일반인 (Civilian)</h4>
                  <p>주제와 키워드를 알고 있으며, 라이어를 찾아내야 합니다.</p>
                  <ul>
                    <li>주제와 키워드를 알고 있음</li>
                    <li>라이어를 찾아내는 것이 목표</li>
                    <li>대부분의 플레이어가 이 역할</li>
                  </ul>
                </div>

                <div className="role-item">
                  <h4>🎭 라이어 (Liar)</h4>
                  <p>주제와 키워드를 모르며, 정체를 숨기고 게임을 통과해야 합니다.</p>
                  <ul>
                    <li>주제와 키워드를 모름</li>
                    <li>정체를 숨기고 게임 통과가 목표</li>
                    <li>항상 1명만 존재</li>
                  </ul>
                </div>

                <div className="role-item">
                  <h4>🔥 광신도 (Fanatic)</h4>
                  <p>주제와 키워드를 알고 있지만 라이어를 도와야 합니다.</p>
                  <ul>
                    <li>주제와 키워드를 알고 있음</li>
                    <li>라이어를 도와야 함</li>
                    <li>5명 이상일 때만 등장</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 게임 진행 */}
            <Card title="🎮 게임 진행 방법" className="process-card">
              <div className="card-content">
                <div className="step">
                  <h4>1단계: 방 생성 및 참가</h4>
                  <p>호스트가 방을 만들고, 다른 플레이어들이 방 코드로 참가합니다.</p>
                </div>

                <div className="step">
                  <h4>2단계: 역할 배정</h4>
                  <p>서버에서 자동으로 라이어, 광신도, 일반인 역할을 배정합니다.</p>
                </div>

                <div className="step">
                  <h4>3단계: 주제 및 키워드 선택</h4>
                  <p>서버에서 랜덤하게 주제(음식, 동물, 영화 등)와 키워드를 선택합니다.</p>
                </div>

                <div className="step">
                  <h4>4단계: 설명 단계</h4>
                  <p>각 플레이어가 차례로 주제에 대해 설명합니다. (라이어는 추측해서 설명)</p>
                </div>

                <div className="step">
                  <h4>5단계: 투표 단계</h4>
                  <p>모든 플레이어가 라이어로 의심되는 사람에게 투표합니다.</p>
                </div>

                <div className="step">
                  <h4>6단계: 결과 확인</h4>
                  <p>라이어가 투표로 제외되면 일반인 팀 승리, 아니면 다음 라운드 진행</p>
                </div>
              </div>
            </Card>

            {/* 게임 규칙 */}
            <Card title="📋 게임 규칙" className="rules-card">
              <div className="card-content">
                <h4>인원 규칙</h4>
                <ul>
                  <li>최소 3명, 최대 8명까지 참가 가능</li>
                  <li>첫 번째 플레이어가 호스트가 됩니다</li>
                </ul>

                <h4>게임 규칙</h4>
                <ul>
                  <li>라이어는 주제와 키워드를 직접 말하면 안 됩니다</li>
                  <li>광신도는 라이어를 도와야 합니다</li>
                  <li>일반인은 라이어를 찾아야 합니다</li>
                  <li>최대 5라운드까지 진행됩니다</li>
                </ul>

                <h4>승리 조건</h4>
                <ul>
                  <li><strong>일반인 팀:</strong> 라이어를 투표로 제외시키기</li>
                  <li><strong>라이어:</strong> 모든 라운드를 통과하기</li>
                  <li><strong>광신도:</strong> 라이어가 승리하기</li>
                </ul>
              </div>
            </Card>

            {/* 팁과 전략 */}
            <Card title="💡 게임 팁" className="tips-card">
              <div className="card-content">
                <h4>일반인을 위한 팁</h4>
                <ul>
                  <li>너무 직접적으로 키워드를 말하지 마세요</li>
                  <li>라이어를 속이기 위해 의도적으로 애매하게 설명하세요</li>
                  <li>다른 플레이어들의 설명을 자세히 들어보세요</li>
                </ul>

                <h4>라이어를 위한 팁</h4>
                <ul>
                  <li>다른 플레이어들의 설명을 잘 들어보세요</li>
                  <li>너무 틀린 내용을 말하지 않도록 주의하세요</li>
                  <li>자연스럽게 일반인인 척 행동하세요</li>
                </ul>

                <h4>광신도를 위한 팁</h4>
                <ul>
                  <li>라이어를 도우되 너무 뻔하게 하지 마세요</li>
                  <li>일반인인 척하면서 라이어를 보호하세요</li>
                  <li>의심을 다른 플레이어에게 돌리세요</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="action-section">
            <Link href="/create-room">
              <Button variant="primary" size="large">
                지금 게임 시작하기
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" size="large">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .how-to-play-page {
          padding: var(--space-8) 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .header h1 {
          font-size: var(--font-size-4xl);
          color: var(--color-primary-600);
          margin-bottom: var(--space-4);
        }

        .header p {
          font-size: var(--font-size-lg);
          color: var(--color-gray-600);
          margin: 0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-12);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .role-item {
          background: var(--color-gray-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-200);
        }

        .role-item h4 {
          margin: 0 0 var(--space-2) 0;
          color: var(--color-primary-600);
        }

        .role-item ul {
          margin: var(--space-2) 0 0 0;
          padding-left: var(--space-4);
        }

        .role-item li {
          color: var(--color-gray-600);
          line-height: var(--line-height-relaxed);
        }

        .step {
          background: var(--color-primary-50);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-primary-200);
          margin-bottom: var(--space-3);
        }

        .step h4 {
          margin: 0 0 var(--space-2) 0;
          color: var(--color-primary-700);
        }

        .step p {
          margin: 0;
          color: var(--color-primary-600);
          line-height: var(--line-height-relaxed);
        }

        .rules-card h4 {
          margin: var(--space-4) 0 var(--space-2) 0;
          color: var(--color-primary-600);
        }

        .rules-card h4:first-child {
          margin-top: 0;
        }

        .tips-card h4 {
          margin: var(--space-4) 0 var(--space-2) 0;
          color: var(--color-primary-600);
        }

        .tips-card h4:first-child {
          margin-top: 0;
        }

        .action-section {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .how-to-play-page {
            padding: var(--space-4) 0;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          
          .header h1 {
            font-size: var(--font-size-3xl);
          }
          
          .action-section {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  )
}
