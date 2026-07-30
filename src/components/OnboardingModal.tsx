'use client';

import React, { useState, useEffect } from 'react';
import { Globe, X, MapPin, Check } from 'lucide-react';
import { UserPreferences } from '../types';
import { detectUserRegion, RegionLanguage, REGIONAL_LANGUAGES } from '../lib/geo';
import { usePlatform } from './PlatformContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
  currentPreferences: UserPreferences;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPreferences,
}) => {
  const { platform } = usePlatform();
  const [uiLanguage, setUiLanguage] = useState(currentPreferences.uiLanguage || 'English');
  const [regionName, setRegionName] = useState<string>('Detecting…');
  const [languagesList, setLanguagesList] = useState<RegionLanguage[]>(REGIONAL_LANGUAGES.DEFAULT.languages);

  useEffect(() => {
    let isMounted = true;
    detectUserRegion().then((region) => {
      if (isMounted) {
        setRegionName(region.countryName);
        setLanguagesList(region.languages);
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setUiLanguage(currentPreferences.uiLanguage || 'English');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      uiLanguage,
      preferredAudioLanguages: currentPreferences.preferredAudioLanguages || [],
      preferredSubtitleLanguages: currentPreferences.preferredSubtitleLanguages || [],
      dubOption: currentPreferences.dubOption || 'all',
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#111',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
          padding: '32px',
          color: '#FFF',
          position: 'relative',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
          title="Close"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
            <MapPin size={13} color="var(--primary-color)" />
            <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {regionName}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            Display language
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '6px 0 0', lineHeight: 1.5 }}>
            Choose the language for {platform === 'nprime' ? 'Prime Video' : 'Netflix'} labels and controls.
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />

        {/* Language Picker */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Globe size={13} color="var(--primary-color)" /> Interface language
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
            {languagesList.filter((lang) => lang.code !== 'All').map((lang) => {
              const isSelected = uiLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setUiLanguage(lang.code)}
                  style={{
                    backgroundColor: isSelected ? (platform === 'nprime' ? 'rgba(0, 168, 225, 0.12)' : 'rgba(229, 9, 20, 0.12)') : 'rgba(255,255,255,0.04)',
                    color: isSelected ? '#FFF' : '#AAA',
                    border: isSelected ? '1px solid var(--primary-glow-strong)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '9px 8px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                  {isSelected && <Check size={12} color="var(--primary-color)" />}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#444', margin: '10px 0 0', lineHeight: 1.4 }}>
            This only changes interface text — titles and audio tracks are never hidden.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', color: '#555', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '6px 0' }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              backgroundColor: 'var(--primary-color)',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: '10px 26px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: platform === 'nprime' ? '0 4px 18px rgba(0, 168, 225, 0.3)' : '0 4px 18px rgba(229, 9, 20, 0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Check size={15} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};
