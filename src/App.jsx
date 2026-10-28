import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PillNav } from './components/PillNav';
import { ScrollExpand } from './components/ScrollExpand';
import { AboutSection } from './components/AboutSection';

const BrandLogo = () => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%' }}
    aria-hidden="true"
  >
    <rect width="32" height="32" rx="16" fill="var(--color-forest-green)" />
    <path
      d="M17.8 11.2c-1.1-.3-2.3-.3-3.4 0-2.8.8-4.4 3.4-3.8 6.2.6 2.8 3.2 4.6 6 4.2 1.9-.3 3.3-1.6 3.8-3.3h-4.4v-2.2h6.8c.2.6.2 1.3.1 2-.7 3.3-3.4 5.5-6.8 5.7-3.9.2-7.3-2.6-7.8-6.5-.5-4.2 2.5-8 6.7-8.5 1.7-.2 3.4.1 4.9.8l-1.1 1.6z"
      fill="var(--color-ivory)"
    />
  </svg>
);

const NAV_ITEMS = [
  { label: 'Home', href: '/', ariaLabel: 'Navigate to Homepage' },
  { label: 'About', href: '#about', ariaLabel: 'Scroll to About section' },
  { label: 'Menu', href: '/menu', ariaLabel: 'View full Cafe Menu' },
  { label: 'Gallery', href: '#gallery', ariaLabel: 'Scroll to Gallery section' },
  { label: 'Visit Us', href: '#visit', ariaLabel: 'Scroll to Visit Us & Location details' }
];

export default function App() {
  const scrollExpandRef = useRef(null);
  const pendingDestinationRef = useRef(null);
  const [activeHref, setActiveHref] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || window.location.pathname || '/';
    }
    return '/';
  });

  const executeNavigation = useCallback((item) => {
    const href = item.href;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

    if (href === '/' || href === '#' || href === '#hero') {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior
      });
      if (window.location.pathname !== '/' || window.location.hash !== '') {
        window.history.pushState(null, '', '/');
      }
      return;
    }

    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const isSection = targetElement.tagName.toLowerCase() === 'section';
        // Full-width sections supply their own internal top clearance, so their top edge aligns with viewport top (0 offset)
        // Sub-elements (like inline headings) offset for the fixed navbar height
        const navOffset = isSection ? 0 : 80;
        const elementRect = targetElement.getBoundingClientRect();
        const targetY = elementRect.top + window.pageYOffset - navOffset;

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: scrollBehavior
        });

        if (window.location.hash !== href) {
          window.history.pushState(null, '', href);
        }
      } else {
        // Section not yet created in this step (e.g., #gallery or #visit)
        console.warn(`[Greedy's Cafe] Destination section "${href}" is preserved but not yet implemented.`);
        if (window.location.hash !== href) {
          window.history.pushState(null, '', href);
        }
      }
      return;
    }

    if (href === '/menu') {
      // Route /menu is pending implementation
      console.warn('[Greedy\'s Cafe] Route "/menu" is preserved. Menu page content is pending implementation.');
      if (window.location.pathname !== '/menu') {
        window.history.pushState(null, '', '/menu');
      }
      return;
    }

    if (href.startsWith('/')) {
      window.history.pushState(null, '', href);
    }
  }, []);

  const handleRevealComplete = useCallback(() => {
    if (pendingDestinationRef.current) {
      const destination = pendingDestinationRef.current;
      pendingDestinationRef.current = null;
      executeNavigation(destination);
    }
  }, [executeNavigation]);

  const handleNavItemClick = useCallback(
    (item, index, event) => {
      if (event) {
        event.preventDefault();
      }

      setActiveHref(item.href);

      // If reveal animation is not completed yet:
      if (!scrollExpandRef.current?.isRevealed()) {
        // Record latest requested destination (overrides any prior click)
        pendingDestinationRef.current = item;
        // Advance reveal smoothly to completion
        scrollExpandRef.current?.completeReveal();
        return;
      }

      // If already revealed: execute navigation immediately
      executeNavigation(item);
    },
    [executeNavigation]
  );

  // Keep active navbar link in sync during document scrolling
  useEffect(() => {
    const aboutEl = document.getElementById('about');
    const heroEl = document.getElementById('hero');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'about') {
              setActiveHref('#about');
            } else if (entry.target.id === 'hero' && window.scrollY < 200) {
              setActiveHref('/');
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    if (aboutEl) observer.observe(aboutEl);
    if (heroEl) observer.observe(heroEl);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Controlled Website Preview Reveal Experience with ONE Main Navbar */}
        <section id="hero" aria-label="Greedy's Cafe Opening Reveal">
          <ScrollExpand
            ref={scrollExpandRef}
            src="/images/hero-cafe.jpg"
            alt="Warm and inviting modern artisan cafe interior with wooden tables, soft ambient lighting, and indoor greenery"
            title="Greedy's Cafe"
            scrollHint="SCROLL TO EXPLORE"
            onRevealComplete={handleRevealComplete}
            navComponent={
              <PillNav
                logo={<BrandLogo />}
                logoAlt="Greedy's Cafe"
                logoHref="/"
                onLogoClick={(event) =>
                  handleNavItemClick(
                    { label: 'Home', href: '/', ariaLabel: 'Navigate to Homepage' },
                    0,
                    event
                  )
                }
                items={NAV_ITEMS}
                activeHref={activeHref}
                onItemClick={handleNavItemClick}
                itemStyle="pill"
                hoverEffect="fill"
                indicator="dot"
                collapse="auto"
                theme="greedys"
                size="md"
                ariaLabel="Primary Site Navigation"
              />
            }
            startWidthDesktop={58}
            startHeightDesktop={64}
            startWidthMobile={86}
            startHeightMobile={72}
            startRadius={20}
            smoothing={0.12}
          />
        </section>

        {/* Editorial Story Section */}
        <AboutSection id="about" />
      </main>
    </div>
  );
}
