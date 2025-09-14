import React from 'react';
import '../styles/Card.css';

const Card = ({ 
  children, 
  title, 
  className = '', 
  variant = 'default',
  onClick,
  clickable = false
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    clickable ? 'card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {title && <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
