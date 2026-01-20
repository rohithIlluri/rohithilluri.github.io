# PHYSICS & REALITY METRICS: MASTER REVAMP PLAN
## Advanced Animations, Physics Interactions & Real-time Analytics Blueprint

**Portfolio:** rohithilluri.github.io
**Current Stack:** React 19, Tailwind CSS, GSAP
**Branch:** claude/revamp-physics-metrics-LZdVq

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Physics-Based Animations Revamp](#3-physics-based-animations-revamp)
4. [Reality Metrics Implementation](#4-reality-metrics-implementation)
5. [Performance Monitoring System](#5-performance-monitoring-system)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Phases](#7-implementation-phases)
8. [Code Examples & Patterns](#8-code-examples--patterns)
9. [Testing & Validation](#9-testing--validation)
10. [Deployment Checklist](#10-deployment-checklist)

---

# 1. EXECUTIVE SUMMARY

## Goals

### Physics Revamp
Transform the portfolio from basic CSS animations to a physics-driven experience with:
- Spring-based animations with natural easing
- Particle systems for visual interest
- Magnetic cursor interactions
- Parallax scrolling with physics simulation
- Smooth, fluid transitions that feel organic

### Reality Metrics
Implement comprehensive analytics without compromising privacy:
- Core Web Vitals monitoring
- User interaction heatmaps
- Scroll depth tracking
- Component render performance
- Error and crash reporting
- A/B testing infrastructure

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| First Contentful Paint | ~1.2s | < 0.8s |
| Time to Interactive | ~2.5s | < 1.5s |
| Cumulative Layout Shift | ~0.15 | < 0.05 |
| Animation Frame Rate | 45-60fps | 60fps stable |
| Largest Contentful Paint | ~2.8s | < 1.5s |

---

# 2. CURRENT STATE ANALYSIS

## Existing Animations

### GSAP Usage (Hero.js)
```javascript
// Current: SVG stroke drawing
gsap.to(icon.paths, {
  strokeDashoffset: 0,
  duration: 2,
  ease: "power2.inOut"
});
```

### CSS Keyframes (index.css)
```css
/* Current: Basic liquid float */
@keyframes liquidFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
  50% { transform: translateY(-20px) rotate(5deg); opacity: 0.5; }
}
```

## Current Metrics (Limited)
- Error boundary with ID generation
- Console logging in development
- No production analytics
- No performance monitoring

## Identified Gaps

| Category | Gap |
|----------|-----|
| Physics | No spring physics, no inertia, no collision detection |
| Interactions | Basic hover states only, no cursor tracking |
| Particles | No particle systems |
| Metrics | Zero user analytics, no Core Web Vitals |
| Performance | No real-time FPS monitoring |
| A/B Testing | Not implemented |

---

# 3. PHYSICS-BASED ANIMATIONS REVAMP

## 3.1 Spring Physics System

### Implementation: Custom Spring Hook
```javascript
// /src/hooks/useSpring.js
import { useRef, useCallback, useEffect, useState } from 'react';

const useSpring = (initialValue, config = {}) => {
  const {
    stiffness = 150,
    damping = 15,
    mass = 1,
    precision = 0.01
  } = config;

  const [value, setValue] = useState(initialValue);
  const velocity = useRef(0);
  const target = useRef(initialValue);
  const animationFrame = useRef(null);

  const animate = useCallback(() => {
    const springForce = -stiffness * (value - target.current);
    const dampingForce = -damping * velocity.current;
    const acceleration = (springForce + dampingForce) / mass;

    velocity.current += acceleration * (1 / 60);
    const newValue = value + velocity.current * (1 / 60);

    if (Math.abs(newValue - target.current) < precision &&
        Math.abs(velocity.current) < precision) {
      setValue(target.current);
      velocity.current = 0;
      return;
    }

    setValue(newValue);
    animationFrame.current = requestAnimationFrame(animate);
  }, [value, stiffness, damping, mass, precision]);

  const setTarget = useCallback((newTarget) => {
    target.current = newTarget;
    if (!animationFrame.current) {
      animationFrame.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return [value, setTarget];
};

export default useSpring;
```

### Spring Presets
```javascript
// /src/constants/physics.js
export const SPRING_PRESETS = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molasses: { stiffness: 280, damping: 120, mass: 1 }
};
```

---

## 3.2 Magnetic Cursor Effects

### Magnetic Button Component
```javascript
// /src/components/ui/MagneticButton.js
import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';

const MagneticButton = ({ children, strength = 0.5, className = '' }) => {
  const buttonRef = useRef(null);
  const boundingRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const button = buttonRef.current;
    if (!button) return;

    if (!boundingRef.current) {
      boundingRef.current = button.getBoundingClientRect();
    }

    const { left, top, width, height } = boundingRef.current;
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(button, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
    boundingRef.current = null;
  }, []);

  return (
    <button
      ref={buttonRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default MagneticButton;
```

---

## 3.3 Particle System

### Floating Particles Component
```javascript
// /src/components/effects/ParticleField.js
import { useRef, useEffect, useMemo } from 'react';

const ParticleField = ({
  particleCount = 50,
  colors = ['#60a5fa', '#a78bfa', '#34d399'],
  maxSize = 4,
  speed = 0.5
}) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const initParticles = useMemo(() => () => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    return Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * maxSize + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2
    }));
  }, [particleCount, colors, maxSize, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = initParticles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mousePos.current.x;
        const dy = p.y - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.2;
          p.vy += (dy / dist) * force * 0.2;
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ParticleField;
```

---

## 3.4 Physics-Based Scroll Animations

### Smooth Parallax System
```javascript
// /src/hooks/useParallax.js
import { useRef, useEffect, useState } from 'react';

const useParallax = (speed = 0.5, offset = 0) => {
  const elementRef = useRef(null);
  const [transform, setTransform] = useState(0);
  const velocity = useRef(0);
  const currentY = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    let animationFrame;

    const smoothScroll = () => {
      const diff = targetY.current - currentY.current;
      velocity.current += diff * 0.1;
      velocity.current *= 0.8; // Damping
      currentY.current += velocity.current;

      setTransform(currentY.current * speed + offset);
      animationFrame = requestAnimationFrame(smoothScroll);
    };

    const handleScroll = () => {
      if (!elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      targetY.current = (rect.top - viewportCenter) * -1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrame = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [speed, offset]);

  return { ref: elementRef, transform };
};

export default useParallax;
```

---

## 3.5 Inertial Scrolling & Momentum

### Smooth Scroll Container
```javascript
// /src/components/layout/SmoothScroll.js
import { useRef, useEffect, useCallback } from 'react';

const SmoothScroll = ({ children }) => {
  const scrollingContainerRef = useRef(null);
  const data = useRef({
    ease: 0.1,
    current: 0,
    previous: 0,
    rounded: 0
  });

  useEffect(() => {
    const setBodyHeight = () => {
      document.body.style.height =
        `${scrollingContainerRef.current.getBoundingClientRect().height}px`;
    };

    const smoothScrollingHandler = () => {
      data.current.current = window.scrollY;
      data.current.previous +=
        (data.current.current - data.current.previous) * data.current.ease;
      data.current.rounded = Math.round(data.current.previous * 100) / 100;

      scrollingContainerRef.current.style.transform =
        `translateY(-${data.current.rounded}px)`;

      requestAnimationFrame(smoothScrollingHandler);
    };

    setBodyHeight();
    requestAnimationFrame(smoothScrollingHandler);

    window.addEventListener('resize', setBodyHeight);
    return () => window.removeEventListener('resize', setBodyHeight);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full will-change-transform">
      <div ref={scrollingContainerRef}>
        {children}
      </div>
    </div>
  );
};

export default SmoothScroll;
```

---

## 3.6 Text Reveal Animations

### Split Text with Physics
```javascript
// /src/components/ui/SplitText.js
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const SplitText = ({ children, delay = 0, stagger = 0.03 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const chars = containerRef.current.querySelectorAll('.char');

    gsap.fromTo(chars,
      {
        y: 100,
        opacity: 0,
        rotationX: -90
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.8,
        stagger: stagger,
        delay: delay,
        ease: 'back.out(1.7)'
      }
    );
  }, [delay, stagger]);

  const splitChars = children.split('').map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{ transformOrigin: '50% 50% -20px' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div ref={containerRef} className="overflow-hidden">
      {splitChars}
    </div>
  );
};

export default SplitText;
```

---

# 4. REALITY METRICS IMPLEMENTATION

## 4.1 Core Web Vitals Monitoring

### Web Vitals Hook
```javascript
// /src/hooks/useWebVitals.js
import { useEffect, useCallback } from 'react';

const useWebVitals = (onReport) => {
  const reportMetric = useCallback((metric) => {
    const data = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good', 'needs-improvement', 'poor'
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now()
    };

    if (onReport) {
      onReport(data);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, metric.value, metric.rating);
    }
  }, [onReport]);

  useEffect(() => {
    const loadWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

        onCLS(reportMetric);
        onINP(reportMetric);
        onFCP(reportMetric);
        onLCP(reportMetric);
        onTTFB(reportMetric);
      } catch (error) {
        console.error('Failed to load web-vitals:', error);
      }
    };

    loadWebVitals();
  }, [reportMetric]);
};

export default useWebVitals;
```

### Metrics Dashboard Component
```javascript
// /src/components/dev/MetricsDashboard.js
import { useState, useEffect } from 'react';

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    vitals: {}
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: frameCount,
          memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576)
          } : null
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'F2') setIsVisible(prev => !prev);
    };

    requestAnimationFrame(measureFPS);
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg font-mono text-xs z-50">
      <div className="text-green-400">FPS: {metrics.fps}</div>
      {metrics.memory && (
        <div className="text-blue-400">
          Memory: {metrics.memory.used}MB / {metrics.memory.total}MB
        </div>
      )}
      <div className="text-gray-400 mt-2 text-[10px]">Press F2 to toggle</div>
    </div>
  );
};

export default MetricsDashboard;
```

---

## 4.2 User Interaction Analytics

### Analytics Service
```javascript
// /src/utils/analytics.js
const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_ENDPOINT;

class Analytics {
  constructor() {
    this.queue = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getOrCreateUserId();
    this.flushInterval = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getOrCreateUserId() {
    let userId = localStorage.getItem('portfolio_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('portfolio_user_id', userId);
    }
    return userId;
  }

  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.queue.push(event);

    // Immediate send for critical events
    if (['error', 'conversion', 'purchase'].includes(eventName)) {
      this.flush();
    }
  }

  // Page view tracking
  pageView(pageName, properties = {}) {
    this.track('page_view', { pageName, ...properties });
  }

  // Component interaction
  interaction(component, action, properties = {}) {
    this.track('interaction', { component, action, ...properties });
  }

  // Scroll depth
  scrollDepth(depth, section) {
    this.track('scroll_depth', { depth, section });
  }

  // Performance metric
  performance(metric, value, rating) {
    this.track('performance', { metric, value, rating });
  }

  // Error tracking
  error(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  async flush() {
    if (this.queue.length === 0) return;
    if (!ANALYTICS_ENDPOINT) {
      // Development mode: just log
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', this.queue);
      }
      this.queue = [];
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...events);
    }
  }

  startAutoFlush(interval = 10000) {
    this.flushInterval = setInterval(() => this.flush(), interval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flush();
    });
  }

  stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const analytics = new Analytics();
export default analytics;
```

---

## 4.3 Scroll Depth Tracking

### Scroll Tracker Hook
```javascript
// /src/hooks/useScrollTracking.js
import { useEffect, useRef, useCallback } from 'react';
import analytics from '../utils/analytics';

const useScrollTracking = (sections = []) => {
  const trackedDepths = useRef(new Set());
  const sectionObservers = useRef([]);

  const trackDepth = useCallback((depth) => {
    if (trackedDepths.current.has(depth)) return;
    trackedDepths.current.add(depth);
    analytics.scrollDepth(depth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track at 25%, 50%, 75%, 100%
      [25, 50, 75, 100].forEach(threshold => {
        if (scrollPercent >= threshold) {
          trackDepth(threshold);
        }
      });
    };

    // Track section visibility
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          analytics.track('section_view', {
            section: entry.target.dataset.section
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5
    });

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.dataset.section = sectionId;
        observer.observe(element);
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [sections, trackDepth]);
};

export default useScrollTracking;
```

---

## 4.4 Click Heatmap (Development Tool)

### Heatmap Collector
```javascript
// /src/components/dev/ClickHeatmap.js
import { useEffect, useState, useRef } from 'react';

const ClickHeatmap = ({ enabled = false }) => {
  const [clicks, setClicks] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e) => {
      const newClick = {
        x: e.clientX,
        y: e.clientY + window.scrollY,
        timestamp: Date.now()
      };
      setClicks(prev => [...prev, newClick].slice(-500)); // Keep last 500
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clicks.forEach(click => {
      const gradient = ctx.createRadialGradient(
        click.x, click.y, 0,
        click.x, click.y, 30
      );
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(click.x, click.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }, [clicks, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};

export default ClickHeatmap;
```

---

## 4.5 A/B Testing Framework

### Experiment Service
```javascript
// /src/utils/experiments.js
const EXPERIMENTS = {
  hero_cta_variant: {
    variants: ['A', 'B', 'C'],
    weights: [0.34, 0.33, 0.33]
  },
  animation_intensity: {
    variants: ['low', 'medium', 'high'],
    weights: [0.33, 0.34, 0.33]
  }
};

class ExperimentService {
  constructor() {
    this.assignments = this.loadAssignments();
  }

  loadAssignments() {
    try {
      const stored = localStorage.getItem('experiment_assignments');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveAssignments() {
    localStorage.setItem('experiment_assignments', JSON.stringify(this.assignments));
  }

  getVariant(experimentName) {
    // Return existing assignment
    if (this.assignments[experimentName]) {
      return this.assignments[experimentName];
    }

    // New assignment
    const experiment = EXPERIMENTS[experimentName];
    if (!experiment) return null;

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.weights[i];
      if (random < cumulative) {
        this.assignments[experimentName] = experiment.variants[i];
        this.saveAssignments();
        return experiment.variants[i];
      }
    }

    return experiment.variants[0];
  }

  trackExperiment(experimentName, action, properties = {}) {
    const variant = this.assignments[experimentName];
    if (!variant) return;

    analytics.track('experiment', {
      experiment: experimentName,
      variant,
      action,
      ...properties
    });
  }
}

export const experiments = new ExperimentService();
export default experiments;
```

### Experiment Hook
```javascript
// /src/hooks/useExperiment.js
import { useMemo, useCallback } from 'react';
import experiments from '../utils/experiments';
import analytics from '../utils/analytics';

const useExperiment = (experimentName) => {
  const variant = useMemo(() =>
    experiments.getVariant(experimentName),
    [experimentName]
  );

  const trackConversion = useCallback((action = 'conversion') => {
    experiments.trackExperiment(experimentName, action);
  }, [experimentName]);

  return { variant, trackConversion };
};

export default useExperiment;
```

---

# 5. PERFORMANCE MONITORING SYSTEM

## 5.1 Render Performance Tracker

### Performance Observer
```javascript
// /src/utils/performanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startMeasure(name) {
    performance.mark(`${name}-start`);
    return () => this.endMeasure(name);
  }

  endMeasure(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      const duration = entries[entries.length - 1].duration;
      this.recordMetric(name, duration);
      performance.clearMeasures(name);
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      return duration;
    }
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name);
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getStats(name) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 50) {
          this.recordMetric('long-task', entry.duration);
          console.warn(`[Long Task] ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  observeLayoutShifts() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          this.recordMetric('layout-shift', entry.value);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  disconnect() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
```

---

## 5.2 Component Render Profiler

### Profiler Wrapper
```javascript
// /src/components/dev/RenderProfiler.js
import { Profiler, useState, useCallback } from 'react';

const RenderProfiler = ({ id, children, enabled = process.env.NODE_ENV === 'development' }) => {
  const [renders, setRenders] = useState([]);

  const onRenderCallback = useCallback((
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    if (!enabled) return;

    const renderData = {
      id,
      phase,
      actualDuration: actualDuration.toFixed(2),
      baseDuration: baseDuration.toFixed(2),
      startTime,
      commitTime,
      timestamp: Date.now()
    };

    setRenders(prev => [...prev.slice(-19), renderData]);

    if (actualDuration > 16) {
      console.warn(`[Slow Render] ${id}: ${actualDuration.toFixed(2)}ms (target: 16ms)`);
    }
  }, [enabled]);

  if (!enabled) {
    return children;
  }

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

export default RenderProfiler;
```

---

# 6. TECHNICAL ARCHITECTURE

## 6.1 File Structure

```
/src
├── /components
│   ├── /effects
│   │   ├── ParticleField.js
│   │   ├── CursorGlow.js
│   │   └── BackgroundGradient.js
│   ├── /physics
│   │   ├── SpringElement.js
│   │   ├── MagneticButton.js
│   │   └── ParallaxLayer.js
│   ├── /ui
│   │   ├── SplitText.js
│   │   ├── RevealOnScroll.js
│   │   └── StaggeredList.js
│   └── /dev
│       ├── MetricsDashboard.js
│       ├── ClickHeatmap.js
│       └── RenderProfiler.js
├── /hooks
│   ├── useSpring.js
│   ├── useParallax.js
│   ├── useScrollTracking.js
│   ├── useWebVitals.js
│   ├── useExperiment.js
│   └── useAnimationFrame.js
├── /utils
│   ├── analytics.js
│   ├── experiments.js
│   ├── performanceMonitor.js
│   └── easing.js
├── /constants
│   ├── physics.js
│   └── animations.js
└── /context
    └── AnalyticsContext.js
```

## 6.2 Dependencies to Add

```json
{
  "dependencies": {
    "web-vitals": "^3.5.0"
  },
  "devDependencies": {
    "@types/web-vitals": "^3.0.0"
  }
}
```

## 6.3 Environment Variables

```env
# .env
REACT_APP_ANALYTICS_ENDPOINT=https://api.youranalytics.com/events
REACT_APP_ENABLE_DEV_METRICS=true
```

---

# 7. IMPLEMENTATION PHASES

## Phase 1: Foundation (Days 1-3)

### Deliverables
- [ ] Create `/src/hooks/useSpring.js` - Core spring physics hook
- [ ] Create `/src/hooks/useAnimationFrame.js` - RAF management
- [ ] Create `/src/constants/physics.js` - Spring presets and configs
- [ ] Create `/src/utils/easing.js` - Custom easing functions
- [ ] Install `web-vitals` package

### Testing
- Unit tests for spring physics calculations
- Verify animation performance at 60fps

---

## Phase 2: Core Physics Components (Days 4-7)

### Deliverables
- [ ] Create `/src/components/physics/MagneticButton.js`
- [ ] Create `/src/components/physics/SpringElement.js`
- [ ] Create `/src/components/physics/ParallaxLayer.js`
- [ ] Create `/src/hooks/useParallax.js`
- [ ] Update Hero.js to use new physics components

### Integration Points
- Replace existing hover effects with spring-based animations
- Add magnetic effect to social links in Hero
- Implement parallax on background elements

---

## Phase 3: Visual Effects (Days 8-11)

### Deliverables
- [ ] Create `/src/components/effects/ParticleField.js`
- [ ] Create `/src/components/effects/CursorGlow.js`
- [ ] Create `/src/components/ui/SplitText.js`
- [ ] Create `/src/components/ui/RevealOnScroll.js`
- [ ] Implement particle system on Hero section

### Testing
- Performance test particle system (target: <5% CPU usage)
- Mobile performance verification
- Battery usage on mobile devices

---

## Phase 4: Metrics Infrastructure (Days 12-15)

### Deliverables
- [ ] Create `/src/utils/analytics.js` - Analytics service
- [ ] Create `/src/hooks/useWebVitals.js` - Core Web Vitals tracking
- [ ] Create `/src/hooks/useScrollTracking.js` - Scroll depth tracking
- [ ] Create `/src/context/AnalyticsContext.js` - React context provider
- [ ] Integrate analytics into App.js

### Data Points to Track
- Page views
- Scroll depth (25%, 50%, 75%, 100%)
- Section views (Hero, Skills, Projects, Music, Movies)
- Click interactions (social links, project cards, navigation)
- Time on page

---

## Phase 5: Performance Monitoring (Days 16-18)

### Deliverables
- [ ] Create `/src/utils/performanceMonitor.js`
- [ ] Create `/src/components/dev/MetricsDashboard.js`
- [ ] Create `/src/components/dev/RenderProfiler.js`
- [ ] Implement long task detection
- [ ] Add layout shift monitoring

### Dashboard Features
- Real-time FPS counter
- Memory usage (where available)
- Render time per component
- Core Web Vitals display

---

## Phase 6: A/B Testing & Polish (Days 19-21)

### Deliverables
- [ ] Create `/src/utils/experiments.js`
- [ ] Create `/src/hooks/useExperiment.js`
- [ ] Set up initial experiments:
  - Hero CTA variant test
  - Animation intensity preference
- [ ] Final performance optimization pass
- [ ] Documentation

### Experiments
| Experiment | Variants | Goal |
|------------|----------|------|
| hero_cta_variant | A/B/C | Maximize click-through |
| animation_intensity | low/medium/high | Find optimal engagement |

---

# 8. CODE EXAMPLES & PATTERNS

## 8.1 Integrating Spring Physics into Existing Components

### Before (Skills.js)
```javascript
const SkillItem = React.memo(({ skill }) => (
  <div className="hover:scale-105 transition-transform duration-200">
    {/* content */}
  </div>
));
```

### After (Skills.js)
```javascript
import useSpring from '../hooks/useSpring';
import { SPRING_PRESETS } from '../constants/physics';

const SkillItem = React.memo(({ skill }) => {
  const [scale, setScale] = useSpring(1, SPRING_PRESETS.gentle);
  const [rotation, setRotation] = useSpring(0, SPRING_PRESETS.wobbly);

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`
      }}
      onMouseEnter={() => {
        setScale(1.1);
        setRotation(3);
      }}
      onMouseLeave={() => {
        setScale(1);
        setRotation(0);
      }}
    >
      {/* content */}
    </div>
  );
});
```

## 8.2 Adding Analytics to Navigation

```javascript
// TopNav.js
import analytics from '../utils/analytics';

const TopNav = () => {
  const handleNavClick = (destination) => {
    analytics.interaction('navigation', 'click', { destination });
  };

  return (
    <nav>
      <Link to="/" onClick={() => handleNavClick('home')}>Home</Link>
      <Link to="/projects" onClick={() => handleNavClick('projects')}>Projects</Link>
    </nav>
  );
};
```

## 8.3 Using Experiments in Components

```javascript
// Hero.js
import useExperiment from '../hooks/useExperiment';

const Hero = () => {
  const { variant, trackConversion } = useExperiment('hero_cta_variant');

  const ctaText = {
    A: 'View My Work',
    B: 'Explore Projects',
    C: 'See What I Built'
  }[variant];

  return (
    <button onClick={() => {
      trackConversion('cta_click');
      // navigate to projects
    }}>
      {ctaText}
    </button>
  );
};
```

---

# 9. TESTING & VALIDATION

## 9.1 Performance Benchmarks

| Test | Tool | Target |
|------|------|--------|
| FPS Stability | Chrome DevTools | 60fps ± 5 |
| Memory Leak | Chrome Memory Tab | No growth over 5min |
| Bundle Size | `npm run build` | < 250KB gzipped |
| LCP | Lighthouse | < 1.5s |
| FID/INP | Lighthouse | < 100ms |
| CLS | Lighthouse | < 0.05 |

## 9.2 Test Commands

```bash
# Run performance audit
npx lighthouse http://localhost:3000 --output=html --view

# Bundle analysis
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json

# Memory profiling
# Use Chrome DevTools > Memory > Heap Snapshot
```

## 9.3 Cross-Browser Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | Required |
| Firefox | Latest | Required |
| Safari | Latest | Required |
| Edge | Latest | Required |
| Mobile Safari | iOS 15+ | Required |
| Chrome Android | Latest | Required |

---

# 10. DEPLOYMENT CHECKLIST

## Pre-Deployment

- [ ] All unit tests passing
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] No console errors in production build
- [ ] Analytics endpoint configured
- [ ] Environment variables set
- [ ] Bundle size within limits

## Post-Deployment Verification

- [ ] Core Web Vitals passing in PageSpeed Insights
- [ ] Analytics events being received
- [ ] No JavaScript errors in Sentry/monitoring
- [ ] Mobile performance verified
- [ ] Cross-browser testing completed

## Rollback Plan

```bash
# If issues discovered, rollback to previous commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>
```

---

# SUMMARY

## Key Deliverables

| Category | Items |
|----------|-------|
| Physics Hooks | useSpring, useParallax, useAnimationFrame |
| Physics Components | MagneticButton, SpringElement, ParallaxLayer |
| Visual Effects | ParticleField, CursorGlow, SplitText |
| Analytics | Core Web Vitals, Scroll Tracking, User Interactions |
| Performance | MetricsDashboard, RenderProfiler, Long Task Detection |
| A/B Testing | Experiment service, useExperiment hook |

## Expected Impact

- **Performance**: 20-30% improvement in Core Web Vitals
- **Engagement**: Physics-based interactions increase time on page
- **Insights**: Data-driven decisions with comprehensive analytics
- **Development**: Real-time performance monitoring speeds debugging

## Maintenance

- Review analytics data weekly
- A/B test results monthly
- Performance regression testing on each deploy
- Update dependencies quarterly

---

**Document Version:** 1.0
**Last Updated:** January 2026
**For:** Claude Code Implementation
**Branch:** claude/revamp-physics-metrics-LZdVq
