import React from 'react';
import './CircularText.css';

const CircularText = ({ 
  text = 'EARTHCRAFT • ARCHITECTURE • DESIGN • BUILD • ', 
  spinDuration = 25, 
  onHover = 'speedUp' 
}) => {
  const letters = text.split('');

  return (
    <div className={`circular-text-container ${onHover}`}>
      <div 
        className="circular-text" 
        style={{ animationDuration: `${spinDuration}s` }}
      >
        {letters.map((letter, i) => {
          const rotationDeg = (360 / letters.length) * i;
          return (
            <span 
              key={i} 
              style={{ transform: `rotateZ(${rotationDeg}deg)` }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CircularText;
