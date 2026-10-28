'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ScrollExpand.css';

const clamp = (v, a, b) => (Number.isNaN(v) ? a : v < a ? a : v > b ? b : v);

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export const ScrollExpand = React.forwardRef(function ScrollExpand(
  {
    src = '/images/hero-cafe.jpg',
    alt = 'Warm and inviting modern artisan cafe interior with wooden tables, soft ambient lighting, and indoor greenery',
    title = "Greedy's Cafe",
    scrollHint = 'SCROLL TO EXPLORE',
    navComponent,
    startWidthDesktop = 58,
    startHeightDesktop = 64,
    startWidthMobile = 86,
    startHeightMobile = 72,
    startRadius = 20,
    smoothing = 0.12,
    onRevealComplete,
    className = '',
    style
  },
  ref
) {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const cueRef = useRef(null);

  const revealedRef = useRef(revealed);
  revealedRef.current = revealed;

  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const applyProgress = useCallback(p => {
    const card = cardRef.current;
    if (!card) return;

    const e = smoothstep(0, 1, p);
    const isMobile = window.innerWidth <= 640;
    const startW = isMobile ? startWidthMobile : startWidthDesktop;
    const startH = isMobile ? startHeightMobile : startHeightDesktop;
    const startR = isMobile ? 16 : startRadius;

    // Symmetrical outward expansion from center
    const w = startW + (100 - startW) * e;
    const h = startH + (100 - startH) * e;
    const r = startR * (1 - e);

    card.style.width = `${w}%`;
    card.style.height = `${h}%`;
    card.style.borderRadius = `${r}px`;

    // Subtle elevation shadow and border fade to 0 at full bleed
    const shadowAlpha = 0.2 * (1 - e);
    const borderAlpha = 0.12 * (1 - e);
    card.style.boxShadow = `0 20px 60px -15px rgba(41, 45, 41, ${shadowAlpha})`;
    card.style.borderColor = `rgba(38, 61, 50, ${borderAlpha})`;

    // Subtle gentle photo scale easing
    if (mediaRef.current) {
      mediaRef.current.style.transform = `scale(${1.08 - 0.08 * e})`;
    }

    // Centered title scales smoothly
    if (titleRef.current) {
      titleRef.current.style.transform = `scale(${1 + 0.1 * e})`;
    }

    // Scroll cue fades out
    if (cueRef.current) {
      const cueAlpha = 1 - smoothstep(0, 0.22, p);
      cueRef.current.style.opacity = `${cueAlpha}`;
    }
  }, [startWidthDesktop, startHeightDesktop, startWidthMobile, startHeightMobile, startRadius]);

  const tick = useCallback(() => {
    const k = smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing));
    const stepK = targetRef.current === 1 ? Math.max(k, 0.14) : k;
    currentRef.current += (targetRef.current - currentRef.current) * stepK;

    if (Math.abs(targetRef.current - currentRef.current) < 0.001) {
      currentRef.current = targetRef.current;
      runningRef.current = false;
    }

    applyProgress(currentRef.current);

    // When expansion hits 100%, complete reveal and restore normal document scrolling
    if (currentRef.current >= 0.995 && targetRef.current >= 1) {
      currentRef.current = 1;
      applyProgress(1);
      setRevealed(true);
      document.body.style.overflow = '';
      return;
    }

    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [applyProgress, smoothing]);

  const kick = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const completeReveal = useCallback(() => {
    if (revealedRef.current) return;

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      currentRef.current = 1;
      targetRef.current = 1;
      applyProgress(1);
      setRevealed(true);
      document.body.style.overflow = '';
      return;
    }

    targetRef.current = 1;
    kick();
  }, [applyProgress, kick]);

  React.useImperativeHandle(
    ref,
    () => ({
      completeReveal,
      isRevealed: () => revealedRef.current
    }),
    [completeReveal]
  );

  useEffect(() => {
    if (revealed) {
      document.body.style.overflow = '';
      applyProgress(1);
      const raf = requestAnimationFrame(() => {
        onRevealCompleteRef.current?.();
      });
      return () => cancelAnimationFrame(raf);
    }

    // Lock document scroll during initial controlled reveal stage
    document.body.style.overflow = 'hidden';
    applyProgress(0);

    // Wheel / trackpad input handling
    const onWheel = e => {
      if (revealedRef.current) return;
      e.preventDefault();
      // Smoothly map deltaY to expansion progress
      targetRef.current = clamp(targetRef.current + e.deltaY / 420, 0, 1);
      kick();
    };

    // Touch input handling for mobile devices
    let touchStartY = 0;
    const onTouchStart = e => {
      if (revealedRef.current) return;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = e => {
      if (revealedRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;
      if (e.cancelable) e.preventDefault();
      targetRef.current = clamp(targetRef.current + deltaY / 280, 0, 1);
      kick();
    };

    // Keyboard navigation
    const onKeyDown = e => {
      if (revealedRef.current) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        targetRef.current = clamp(targetRef.current + 0.35, 0, 1);
        kick();
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        targetRef.current = clamp(targetRef.current - 0.35, 0, 1);
        kick();
      }
    };

    const onResize = () => {
      if (!revealedRef.current) {
        applyProgress(currentRef.current);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.body.style.overflow = '';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [revealed, applyProgress, kick]);

  const handleCardClick = () => {
    if (!revealed) {
      targetRef.current = 1;
      kick();
    }
  };

  return (
    <div
      ref={stageRef}
      className={`reveal-stage ${revealed ? 'reveal-stage--completed' : ''} ${className}`.trim()}
      style={style}
    >
      {/* Centered Preview Card */}
      <div
        ref={cardRef}
        className="preview-card"
        onClick={handleCardClick}
        style={{ cursor: revealed ? 'default' : 'pointer' }}
      >
        {/* Background Cafe Photograph with subtle Forest Green scrim */}
        <img
          ref={mediaRef}
          className="preview-card__media"
          src={src}
          alt={alt}
          draggable={false}
        />
        <div className="preview-card__scrim" />

        {/* The ONE and ONLY Navbar (Positioned at top of card, transitions to fixed header) */}
        {navComponent && (
          <div className="preview-card__nav-slot">
            {navComponent}
          </div>
        )}

        {/* Centered Elegant Display Name */}
        <div className="preview-card__center">
          <h1 ref={titleRef} className="preview-card__title">
            {title}
          </h1>
        </div>
      </div>

      {/* Subtle Scroll Cue (Outside the Preview Card at Viewport Bottom) */}
      {!revealed && (
        <div
          ref={cueRef}
          className="reveal-stage__cue"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <span>{scrollHint}</span>
          <svg
            className="reveal-stage__cue-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
});

export default ScrollExpand;
