import React, { memo } from 'react';

const SocialLink = ({ href, label, icon }) => (
  <a
    href={href}
    target={href.startsWith('mailto') ? undefined : '_blank'}
    rel="noopener noreferrer"
    aria-label={label}
    className="term-social"
  >
    <span style={{ color: '#4ade80', fontSize: '10px' }}>{icon}</span>
    <span>{label}</span>
  </a>
);

const Hero = () => (
  <section id="hero" aria-label="About" style={{ marginBottom: '0.5rem' }}>

    {/* $ whoami */}
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">whoami</span>
      </div>
      <div className="term-output">
        <p style={{ color: '#e4e4e4', fontSize: '1.1rem', fontWeight: 600, marginBottom: '2px' }}>
          rohith illuri
        </p>
        <p style={{ color: '#6b6b6b', fontSize: '0.78rem' }}>self-taught developer</p>
      </div>
    </div>

    {/* $ cat about.txt */}
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">cat about.txt</span>
      </div>
      <div className="term-output" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ color: '#e4e4e4', margin: 0 }}>self-taught developer by shipping things on the internet</p>
        <p style={{ color: '#e4e4e4', margin: 0 }}>into tech and physics – things that shape the universe</p>
        <p style={{ color: '#e4e4e4', margin: 0 }}>fascinated by space, science, and ideas that expand the mind</p>
      </div>
    </div>

    {/* $ ls socials/ */}
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">ls socials/</span>
      </div>
      <div className="term-output">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <SocialLink href="https://twitter.com/notforgrind"          label="twitter"  icon="𝕏" />
          <SocialLink href="https://linkedin.com/in/sree-naga-illuri" label="linkedin" icon="in" />
          <SocialLink href="https://github.com/rohithIlluri"          label="github"   icon="gh" />
          <SocialLink href="https://discord.com/users/tars9791"       label="discord"  icon="dc" />
          <SocialLink href="mailto:rohith.illuri@gmail.com"           label="email"    icon="@" />
        </div>
      </div>
    </div>

  </section>
);

export default memo(Hero);
