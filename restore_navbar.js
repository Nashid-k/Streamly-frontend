const fs = require('fs');
const path = require('path');

const navbarPath = path.join('/home/edure/Desktop/nflix/frontend', 'src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

const topHalf = `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Filter, Globe, Settings, Grip, Home, Tv, Film, Plus, User } from 'lucide-react';
import { usePlatform } from './PlatformContext';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'movies' | 'series' | 'anime' | 'mylist';
  setActiveTab: (tab: 'home' | 'movies' | 'series' | 'anime' | 'mylist') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenreFilter?: string;
  onGenreFilterChange?: (genre: string) => void;
  availableGenres?: string[];
  selectedLangFilter?: string;
  selectedDubFilter?: 'all' | 'dubbed_only' | 'subtitled_only' | 'dual_audio';
  uiLanguage?: string;
  onDubFilterChange?: (dub: 'all' | 'dubbed_only' | 'subtitled_only' | 'dual_audio') => void;
  currentProfile: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenOnboardingModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  onSearchChange,
  selectedGenreFilter = 'All',
  onGenreFilterChange,
  availableGenres = [],
  selectedLangFilter = 'All',
  selectedDubFilter = 'all',
  uiLanguage = 'English',
  onDubFilterChange,
  currentProfile,
  onOpenProfileModal,
  onOpenOnboardingModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHotstarExpanded, setIsHotstarExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const appSwitcherRef = useRef<HTMLDivElement>(null);
  const { platform, setPlatform } = usePlatform();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showProfileDropdown && !showAppSwitcher) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (appSwitcherRef.current && !appSwitcherRef.current.contains(e.target as Node)) {
        setShowAppSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showProfileDropdown, showAppSwitcher]);

  useEffect(() => {
    if (searchQuery) setIsSearchOpen(true);
  }, [searchQuery]);

  const copy: Record<string, Record<string, string>> = {
    Hindi: { home: 'होम', series: 'टीवी सीरीज़', movies: 'फ़िल्में', mylist: 'मेरी सूची', languages: 'भाषाएँ', dubbed: 'डब्ड' },
    Tamil: { home: 'முகப்பு', series: 'தொடர்கள்', movies: 'திரைப்படங்கள்', mylist: 'என் பட்டியல்', languages: 'மொழிகள்', dubbed: 'டப்' },
    Malayalam: { home: 'ഹോം', series: 'ടിവി സീരീസ്', movies: 'സിനിമകൾ', mylist: 'എന്റെ പട്ടിക', languages: 'ഭാഷകൾ', dubbed: 'ഡബ്ബ്' },
    Telugu: { home: 'హోమ్', series: 'టీవీ సిరీస్', movies: 'సినిమాలు', mylist: 'నా జాబితా', languages: 'భాషలు', dubbed: 'డబ్' },
  };
  const t = copy[uiLanguage] || { home: 'Home', series: 'TV Series', movies: 'Movies', mylist: 'My List', languages: 'Languages', dubbed: 'Dubbed' };
  const navItems: { id: 'home' | 'movies' | 'series' | 'anime' | 'mylist'; label: string }[] = [
    { id: 'home', label: t.home },
    { id: 'series', label: t.series },
    { id: 'movies', label: t.movies },
    { id: 'anime', label: 'Anime' },
    { id: 'mylist', label: t.mylist },
  ];

  if (platform === 'hotstar') {
    return (
      <>
        {isHotstarExpanded && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }}
            onMouseEnter={() => setIsHotstarExpanded(false)}
          />
        )}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: isHotstarExpanded ? '280px' : '96px',
            background: isHotstarExpanded ? '#0F1014' : 'linear-gradient(to right, rgba(15,16,20,0.9) 0%, transparent 100%)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 0',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setIsHotstarExpanded(true)}
          onMouseLeave={() => setIsHotstarExpanded(false)}
        >
          <div style={{ marginBottom: '40px', padding: '0 32px', display: 'flex', alignItems: 'center', height: '48px', minWidth: '280px' }}>
            <img 
              src="https://secure-media.hotstarext.com/web-assets/prod/images/brand-logos/disney-hotstar-logo-dark.svg" 
              alt="Disney+ Hotstar" 
              style={{ 
                height: '42px',
                transition: 'opacity 0.3s',
                opacity: isHotstarExpanded ? 1 : 0, 
                position: 'absolute',
                left: '32px'
              }} 
            />
            {!isHotstarExpanded && (
               <div style={{ position: 'absolute', left: '32px', color: '#FFF', fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                 D<span style={{color: '#1F80E0'}}>+</span>H
               </div>
            )}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
            <button
              onClick={onOpenProfileModal}
              style={{
                background: 'none', border: 'none', color: '#8F98B2', fontSize: '1.1rem',
                fontWeight: 600, padding: '16px 36px', textAlign: 'left',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '24px',
                whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
            >
              <User size={24} style={{ flexShrink: 0 }} />
              <span style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>My Space</span>
            </button>

            <button
              onClick={() => { document.querySelector('input')?.focus(); }}
              style={{
                background: 'none', border: 'none', color: searchQuery ? '#FFF' : '#8F98B2', fontSize: '1.1rem',
                fontWeight: 600, padding: '16px 36px', textAlign: 'left',
                cursor: 'text', display: 'flex', alignItems: 'center', gap: '24px',
                whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = searchQuery ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
            >
              <Search size={24} style={{ flexShrink: 0 }} />
              <div style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
                />
              </div>
            </button>

            {navItems.map((item) => {
              const isActive = activeTab === item.id && !searchQuery;
              const Icon = item.id === 'home' ? Home : item.id === 'series' ? Tv : item.id === 'movies' ? Film : item.id === 'mylist' ? Plus : Home;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onSearchChange(''); }}
                  style={{
                    background: 'none', border: 'none', 
                    color: isActive ? '#FFF' : '#8F98B2', fontSize: '1.1rem',
                    fontWeight: isActive ? 700 : 500, padding: '16px 36px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '24px',
                    whiteSpace: 'nowrap', transition: 'all 0.2s', width: '100%'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.transform = isHotstarExpanded ? 'scale(1.05) translateX(10px)' : 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#FFF' : '#8F98B2'; e.currentTarget.style.transform = 'scale(1) translateX(0)'; }}
                >
                  <Icon size={24} style={{ flexShrink: 0, color: isActive ? '#FFF' : 'inherit' }} />
                  <span style={{ opacity: isHotstarExpanded ? 1 : 0, transition: 'opacity 0.2s 0.1s' }}>{item.label}</span>
                </button>
              )
            })}
          </nav>
`;

let newBottom = navbarContent.split('{/* Switcher Button inside Sidebar */}')[1];

newBottom = newBottom.replace(/width: isHotstarExpanded \? '100%' : '32px', height: '48px',/g, "width: isHotstarExpanded ? '100%' : '48px', height: '48px', marginLeft: isHotstarExpanded ? '0' : '-8px',");

navbarContent = topHalf + '\\n          {/* Switcher Button inside Sidebar */}' + newBottom;

fs.writeFileSync(navbarPath, navbarContent);
console.log('done restoring and fixing');
