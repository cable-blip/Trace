import React from 'react';

export const ParticleBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        backgroundColor: '#06070A',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(6, 182, 212, 0.07) 0%, transparent 40%),
          radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
          radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 36px 36px',
      }}
    >
      {/* Subtle ambient light pulse overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, #06070A 100%)',
        }}
      />
    </div>
  );
};
