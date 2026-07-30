import React from 'react';
import { usePlatform } from './PlatformContext';

export const HeroSkeleton = () => {
  return (
    <div style={{
      width: '100%',
      height: '80vh',
      minHeight: '600px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'netflixSkeletonPulse 2s infinite ease-in-out'
    }}>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '4%',
        width: '40%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ width: '80%', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '90%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <div style={{ width: '120px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
          <div style={{ width: '160px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
};

export const MovieRowSkeleton = () => {
  const { platform } = usePlatform();
  const cardWidth = platform === 'hotstar' ? '200px' : platform === 'nprime' ? '300px' : '220px';
  const cardHeight = platform === 'hotstar' ? '300px' : platform === 'nprime' ? '169px' : '330px';

  return (
    <div style={{ margin: '30px 0', padding: '0 4%' }}>
      <div style={{ 
        width: '200px', 
        height: '24px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '4px', 
        marginBottom: '16px',
        animation: 'netflixSkeletonPulse 2s infinite ease-in-out'
      }} />
      <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            minWidth: cardWidth,
            height: cardHeight,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
            animation: 'netflixSkeletonPulse 2s infinite ease-in-out',
            animationDelay: `${i * 0.1}s`
          }} />
        ))}
      </div>
    </div>
  );
};
