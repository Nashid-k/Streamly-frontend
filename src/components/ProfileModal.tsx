'use client';

import React from 'react';
import { UserProfile } from '../types';
import { Plus, Check, ShieldAlert } from 'lucide-react';
import { usePlatform } from './PlatformContext';

interface ProfileModalProps {
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  onSelectProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profiles,
  currentProfile,
  onSelectProfile,
  onClose,
}) => {
  const { platform } = usePlatform();
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          width: '92%',
          maxWidth: '820px',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <h1 style={{ fontSize: '3.4rem', fontWeight: 900, color: '#FFF', marginBottom: '12px', letterSpacing: '-0.03em', textAlign: 'center' }}>
          {(platform === 'nprime' || platform === 'hotstar') ? "Who's watching?" : "Who's Watching?"}
        </h1>
        <p style={{ color: '#AAA', fontSize: '1.05rem', marginBottom: '48px', textAlign: 'center' }}>
          Select your profile to customize watch history, recommendations, and watchlist.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {profiles.map((prof) => {
            const isSelected = currentProfile?.id === prof.id;
            return (
              <div
                key={prof.id}
                onClick={() => {
                  if (prof.id === currentProfile?.id) {
                    onClose();
                    return;
                  }
                  onSelectProfile(prof);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '140px',
                    height: '140px',
                    borderRadius: (platform === 'nprime' || platform === 'hotstar') ? '50%' : '8px',
                    overflow: 'hidden',
                    border: isSelected ? '4px solid var(--primary-color)' : '4px solid transparent',
                    boxShadow: isSelected ? '0 0 30px var(--primary-glow-strong)' : '0 8px 24px rgba(0,0,0,0.6)',
                    transition: 'all 0.25s ease',
                    marginBottom: '16px',
                    backgroundColor: '#222',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    if (!isSelected) e.currentTarget.style.borderColor = '#FFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    if (!isSelected) e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <img
                    src={prof.avatarUrl || (platform === 'hotstar' ? 'https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/feature/profile/36.png' : platform === 'nprime' ? 'https://m.media-amazon.com/images/G/01/digital/video/web/v2/default_avatar._CB1582236592_.png' : 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png')}
                    alt={prof.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'var(--primary-color)',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                      }}
                    >
                      <Check size={16} color="#FFF" />
                    </div>
                  )}
                  {prof.isKids && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: (platform === 'nprime' || platform === 'hotstar') ? '15px' : '0',
                        left: 0,
                        right: 0,
                        backgroundColor: (platform === 'nprime' || platform === 'hotstar') ? 'var(--primary-color)' : 'rgba(229, 9, 20, 0.9)',
                        color: '#FFF',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textAlign: 'center',
                        padding: '2px 0',
                        letterSpacing: '0.08em',
                      }}
                    >
                      KIDS
                    </div>
                  )}
                </div>
                <span
                  style={{
                    color: isSelected ? '#FFF' : '#AAA',
                    fontSize: '1.15rem',
                    fontWeight: isSelected ? 800 : 500,
                    transition: 'color 0.2s',
                  }}
                >
                  {prof.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Option */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: (platform === 'nprime' || platform === 'hotstar') ? '50%' : '8px',
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#AAA',
                marginBottom: '16px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.color = '#FFF';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.color = '#AAA';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus size={48} />
            </div>
            <span style={{ color: '#AAA', fontSize: '1.15rem', fontWeight: 500 }}>Add Profile</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '56px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '4px',
            color: '#AAA',
            padding: '10px 36px',
            fontSize: '0.9rem',
            fontWeight: 800,
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FFF';
            e.currentTarget.style.color = '#FFF';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#AAA';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          MANAGE PROFILES
        </button>
      </div>
    </div>
  );
};
