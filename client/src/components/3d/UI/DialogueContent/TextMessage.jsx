import React from 'react';

export default function TextMessage({ text, isTyping }) {
  return (
    <div
      style={{
        color: '#1F2937',
        fontSize: '15px',
        lineHeight: 1.6,
        width: '100%',
      }}
    >
      {text}
      {isTyping && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '16px',
            background: '#5DBFB8',
            marginLeft: '2px',
            animation: 'blink 0.8s infinite',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
