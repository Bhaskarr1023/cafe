import React from 'react';

export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-display)',
          color: 'var(--color-forest-green)',
          marginBottom: 'var(--space-sm)',
          letterSpacing: '-0.02em',
        }}
      >
        Greedy's Cafe
      </h1>
      <p
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-charcoal)',
          opacity: 0.8,
        }}
      >
        Project foundation ready
      </p>
    </main>
  );
}
