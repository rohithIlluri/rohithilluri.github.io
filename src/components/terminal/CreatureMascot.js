import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const BODY_CLASS = {
  celebrate: 'creature-body creature-body--happy',
  error:     'creature-body creature-body--sad',
  wave:      'creature-body creature-body--happy',
  spin:      'creature-body',
  thinking:  'creature-body creature-body--thinking',
  idle:      'creature-body',
  boot:      'creature-body',
};

export default function CreatureMascot({ animationState }) {
  const wrapperRef = useRef(null);
  const bodyRef    = useRef(null);
  const armRRef    = useRef(null);

  // Pop in on mount
  useEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { scale: 0.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.5)', delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    if (!bodyRef.current) return;

    gsap.killTweensOf([bodyRef.current, armRRef.current, wrapperRef.current]);
    bodyRef.current.className = BODY_CLASS[animationState] || 'creature-body';

    switch (animationState) {
      case 'celebrate':
        gsap.timeline()
          .to(bodyRef.current, { y: -22, duration: 0.18, ease: 'power2.out' })
          .to(bodyRef.current, { y: 0,   duration: 0.28, ease: 'bounce.out' })
          .to(bodyRef.current, { y: -12, duration: 0.14, ease: 'power2.out' })
          .to(bodyRef.current, { y: 0,   duration: 0.22, ease: 'bounce.out' });
        break;

      case 'error':
        gsap.to(bodyRef.current, {
          keyframes: [{ x: -7 }, { x: 7 }, { x: -5 }, { x: 5 }, { x: 0 }],
          duration: 0.08,
          ease: 'none',
        });
        break;

      case 'spin':
        gsap.to(wrapperRef.current, {
          rotation: 360,
          duration: 0.75,
          ease: 'power1.inOut',
          onComplete: () => {
            if (wrapperRef.current) wrapperRef.current.style.transform = '';
          },
        });
        break;

      case 'wave':
        if (armRRef.current) {
          gsap.timeline()
            .to(armRRef.current, { rotation: -45, transformOrigin: 'bottom center', duration: 0.12 })
            .to(armRRef.current, { rotation: 20,  duration: 0.12 })
            .to(armRRef.current, { rotation: -45, duration: 0.12 })
            .to(armRRef.current, { rotation: 20,  duration: 0.12 })
            .to(armRRef.current, { rotation: 0,   duration: 0.2, ease: 'elastic.out(1, 0.5)' });
        }
        break;

      default:
        gsap.set(bodyRef.current, { y: 0, x: 0 });
        if (armRRef.current) gsap.set(armRRef.current, { rotation: 0 });
    }
  }, [animationState]);

  return (
    <div className="creature-wrapper" ref={wrapperRef} aria-hidden="true">
      {animationState === 'thinking' && (
        <div className="creature-bubble">...</div>
      )}

      <div style={{ position: 'relative' }}>
        <div className="creature-arm-left" />
        <div className="creature-arm-right" ref={armRRef} />

        <div className="creature-body" ref={bodyRef}>
          <div className="creature-highlight" />
          <div className="creature-eyes">
            <div className="creature-eye creature-eye-left">
              <div className="creature-pupil" />
              <div className="creature-shine" />
            </div>
            <div className="creature-eye creature-eye-right">
              <div className="creature-pupil" />
              <div className="creature-shine" />
            </div>
          </div>
          <div className={`creature-mouth${animationState === 'error' ? ' creature-mouth--sad' : ''}`} />
        </div>
      </div>

      <div className="creature-feet">
        <div className="creature-foot" />
        <div className="creature-foot" />
      </div>

      <div className="creature-name">song</div>
    </div>
  );
}
