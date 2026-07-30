'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#090D16',
        color: '#F8FAFC',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: '#94A3B8', marginBottom: '32px', maxWidth: '500px', fontSize: '1.05rem' }}>
        Sorry, we couldn&apos;t find that page. Explore movies and TV shows in the catalog.
      </p>
      <Link
        href="/"
        style={{
          background: 'var(--primary-color)',
          color: '#FFF',
          padding: '12px 32px',
          borderRadius: '12px',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 8px 25px var(--primary-glow-strong)',
        }}
      >
        Return home
      </Link>
    </div>
  );
}
