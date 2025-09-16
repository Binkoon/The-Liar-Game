import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa'

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(2025)
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Binkoon',
      icon: FaGithub,
      color: '#333333',
      hoverColor: '#000000'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hyun-bin-k-005198211/',
      icon: FaLinkedin,
      color: '#0077B5',
      hoverColor: '#005885'
    },
    {
      name: 'Portfolio',
      url: 'https://myresume-3d74d.web.app',
      icon: FaGlobe,
      color: '#00ff88',
      hoverColor: '#00cc6a'
    }
  ]

  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2
          }}
        >
          {/* 게임 정보 */}
          <div className="footer-info">
            <h3>🎭 라이어 게임</h3>
            <p>친구들과 함께 즐기는 온라인 추리 게임</p>
          </div>

          {/* 소셜 링크 */}
          <div className="footer-social">
            <h4>Connect with Developer</h4>
            <div className="social-links">
              {socialLinks.map((link, index) => {
                const IconComponent = link.icon
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ 
                      '--link-color': link.color,
                      '--link-hover-color': link.hoverColor
                    }}
                    whileHover={{ 
                      scale: 1.08, 
                      y: -4,
                      transition: { 
                        duration: 0.3, 
                        ease: [0.25, 0.1, 0.25, 1] 
                      }
                    }}
                    whileTap={{ 
                      scale: 0.96,
                      transition: { 
                        duration: 0.15, 
                        ease: [0.25, 0.1, 0.25, 1] 
                      }
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { 
                        duration: 0.8, 
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.4 + (index * 0.15)
                      }
                    }}
                  >
                    <IconComponent className="social-icon" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* 저작권 */}
          <div className="footer-copyright">
            <div className="copyright-content">
              <div className="team-info">
                <span className="team-name">Team 이직발사대</span>
                <span className="separator">•</span>
                <span className="developer-name">Developer Binkoon</span>
              </div>
              <p className="copyright-text">
                © {currentYear} All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%);
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          margin-top: var(--space-16);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.05);
        }

        .theme-dark .footer {
          background: linear-gradient(135deg, rgba(12, 74, 110, 0.95) 0%, rgba(7, 89, 133, 0.9) 100%);
          border-top: 1px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            rgba(168, 85, 247, 0.8) 0%, 
            rgba(14, 165, 233, 0.8) 50%, 
            rgba(0, 255, 136, 0.6) 100%
          );
          animation: gameShimmer 6s ease-in-out infinite;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-6);
          text-align: center;
        }

        .footer-info h3 {
          color: var(--color-primary-700);
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-1);
          text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }

        .theme-dark .footer-info h3 {
          color: var(--color-primary-200);
        }

        .footer-info p {
          color: var(--color-primary-600);
          font-size: var(--font-size-xs);
          line-height: var(--line-height-normal);
        }

        .theme-dark .footer-info p {
          color: var(--color-primary-300);
        }

        .footer-social h4 {
          color: var(--color-primary-700);
          font-size: var(--font-size-base);
          margin-bottom: var(--space-3);
        }

        .theme-dark .footer-social h4 {
          color: var(--color-primary-200);
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(168, 85, 247, 0.15);
          border-radius: var(--radius-2xl);
          text-decoration: none;
          color: var(--color-primary-700);
          transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          width: 60px;
          height: 60px;
          position: relative;
          overflow: hidden;
        }

        .theme-dark .social-link {
          background: rgba(12, 74, 110, 0.8);
          border-color: rgba(168, 85, 247, 0.25);
          color: var(--color-primary-200);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .social-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .social-link:hover::before {
          left: 100%;
        }

        .social-link:hover {
          background: var(--link-color);
          color: white;
          border-color: var(--link-color);
          box-shadow: 0 12px 40px rgba(168, 85, 247, 0.25);
          transform: translateY(-3px) scale(1.02);
        }

        .social-link:hover .social-icon {
          color: white;
          transform: rotate(8deg) scale(1.15);
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
        }

        .social-icon {
          font-size: var(--font-size-3xl);
          color: var(--link-color);
          transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
          z-index: 1;
          position: relative;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .theme-dark .social-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .footer-copyright {
          grid-column: 1 / -1;
          padding-top: var(--space-4);
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          margin-top: var(--space-4);
        }

        .theme-dark .footer-copyright {
          border-top-color: rgba(168, 85, 247, 0.3);
        }

        .copyright-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .team-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 600;
          font-size: var(--font-size-base);
        }

        .team-name {
          color: var(--color-primary-700);
          background: linear-gradient(135deg, var(--color-accent-500), var(--color-primary-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .theme-dark .team-name {
          color: var(--color-primary-200);
          background: linear-gradient(135deg, var(--color-accent-400), var(--color-primary-300));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .separator {
          color: var(--color-primary-400);
          font-weight: 300;
        }

        .theme-dark .separator {
          color: var(--color-primary-500);
        }

        .developer-name {
          color: var(--color-primary-600);
          font-weight: 700;
        }

        .theme-dark .developer-name {
          color: var(--color-primary-300);
        }

        .copyright-text {
          color: var(--color-primary-400);
          font-size: var(--font-size-sm);
          margin: 0;
          font-weight: 400;
        }

        .theme-dark .copyright-text {
          color: var(--color-primary-500);
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: var(--space-6) var(--space-4);
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .social-links {
            gap: var(--space-3);
          }

          .social-link {
            width: 50px;
            height: 50px;
            padding: var(--space-3);
          }

          .social-icon {
            font-size: var(--font-size-2xl);
          }

          .team-info {
            font-size: var(--font-size-sm);
            gap: var(--space-1);
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
