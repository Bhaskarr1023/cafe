import React from 'react';
import './AboutSection.css';

/**
 * Editorial-style About Section for Greedy's Cafe
 * Conveys the cafe's neighborhood sanctuary ethos in Vasant Kunj
 */
export function AboutSection({ id = 'about' }) {
  return (
    <section id={id} className="about-section" aria-labelledby="about-heading">
      <div className="about-section__container">
        {/* Narrative Content Column */}
        <div className="about-section__story">
          {/* Eyebrow Label */}
          <div className="about-section__label-wrap">
            <span className="about-section__label-dot" aria-hidden="true" />
            <span className="about-section__label">OUR STORY</span>
          </div>

          {/* Main Editorial Heading */}
          <h2 id="about-heading" className="about-section__heading">
            A little corner for the moments that matter.
          </h2>

          {/* Primary Narrative Paragraph */}
          <p className="about-section__lead">
            Greedy’s Cafe is a welcoming spot in Vasant Kunj to slow down, enjoy good coffee, discover something delicious, and make a little time for yourself.
          </p>

          {/* Secondary Copy Block */}
          <div className="about-section__secondary">
            <p className="about-section__quote">
              From a quiet coffee break to a catch-up with friends, we’re here to make everyday moments feel a little more special.
            </p>
          </div>

          {/* Location Detail Tag */}
          <div className="about-section__location">
            <svg
              className="about-section__location-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="about-section__location-text">VASANT KUNJ, NEW DELHI</span>
          </div>
        </div>

        {/* Editorial Visual Column */}
        <div className="about-section__visual">
          <div className="about-section__frame">
            <img
              src="/images/hero-cafe.jpg"
              alt="Warm artisan cafe interior featuring natural wooden tables, ambient lighting, and indoor greenery"
              className="about-section__image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
