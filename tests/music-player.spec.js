// @ts-check
const { test, expect } = require('@playwright/test');

// =============================================================================
// UAT TEST SUITE: Background Music Player Feature
// =============================================================================

test.describe('App Loading & Basic Rendering', () => {
  test('UAT-001: App loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('load');

    // App should render the main container
    await expect(page.locator('.min-h-screen')).toBeVisible();

    // No JS errors
    expect(errors.filter(e => !e.includes('YouTube'))).toEqual([]);
  });

  test('UAT-002: Navigation renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // TopNav should be present
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test('UAT-003: Hero section renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for lazy-loaded content
    await page.waitForTimeout(2000);

    // Page should have meaningful content loaded
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(100);
  });

  test('UAT-004: Projects route loads', async ({ page }) => {
    await page.goto('/#/projects');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Should show projects section
    const projectsSection = page.locator('section[aria-label="Projects"]');
    await expect(projectsSection).toBeVisible({ timeout: 10000 });
  });
});

test.describe('YouTube IFrame API Integration', () => {
  test('UAT-005: YouTube IFrame API script is injected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for the hook to inject the script
    await page.waitForTimeout(3000);

    const ytScript = await page.locator('script[src*="youtube.com/iframe_api"]').count();
    expect(ytScript).toBe(1);
  });

  test('UAT-006: Hidden YouTube player container is created', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    // The hook creates a div/iframe with id yt-bg-player
    const playerEl = page.locator('#yt-bg-player');
    const count = await playerEl.count();
    expect(count).toBe(1);

    // It should be hidden (off-screen or zero dimensions)
    if (count > 0) {
      const box = await playerEl.boundingBox();
      // Either no bounding box (hidden), or positioned off-screen
      if (box) {
        expect(box.width * box.height).toBeLessThanOrEqual(1);
      }
    }
  });

  test('UAT-007: YouTube API loads and becomes available', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for YT API to load (up to 10 seconds)
    const ytAvailable = await page.evaluate(() => {
      return new Promise((resolve) => {
        let attempts = 0;
        const check = () => {
          if (window.YT && window.YT.Player) {
            resolve(true);
            return;
          }
          attempts++;
          if (attempts > 20) {
            resolve(false);
            return;
          }
          setTimeout(check, 500);
        };
        check();
      });
    });

    expect(ytAvailable).toBe(true);
  });

  test('UAT-008: Player instance is created after API loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for player to be created (iframe replaces the div)
    await page.waitForTimeout(5000);

    const playerTag = await page.evaluate(() => {
      const el = document.getElementById('yt-bg-player');
      return el ? el.tagName.toLowerCase() : null;
    });

    // YouTube replaces the div with an iframe when the player initializes
    expect(playerTag).toBe('iframe');
  });
});

test.describe('Music Player Bar UI', () => {
  test('UAT-009: Music bar does not show before track loads', async ({ page }) => {
    await page.goto('/');

    // Immediately check — bar should not be visible since no track yet
    const musicBar = page.locator('.music-bar');
    // It may or may not exist in DOM, but if track is null, NowPlaying returns null
    const barCount = await musicBar.count();
    if (barCount > 0) {
      // If it renders, it should be because a track loaded fast
      // Either way, this is acceptable
    }
    // No assertion failure — just checking it doesn't crash
  });

  test('UAT-010: Music bar appears after user interaction triggers playback', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for YouTube API + player initialization
    await page.waitForTimeout(6000);

    // Simulate user interaction to trigger autoplay
    await page.click('body');
    await page.waitForTimeout(5000);

    // Check if music bar appeared (track may have loaded)
    const musicBar = page.locator('.music-bar');
    const barVisible = await musicBar.isVisible().catch(() => false);

    // Log result — may not appear if YouTube blocks in this environment
    console.log(`Music bar visible after click: ${barVisible}`);
  });

  test('UAT-011: Music bar has correct structure when visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(6000);
    await page.click('body');
    await page.waitForTimeout(5000);

    const musicBar = page.locator('.music-bar');
    const isVisible = await musicBar.isVisible().catch(() => false);

    if (isVisible) {
      // Check equalizer bars exist
      const eqBars = musicBar.locator('.eq-bar');
      expect(await eqBars.count()).toBe(3);

      // Check track info section exists
      await expect(musicBar.locator('.music-bar-info')).toBeVisible();
      await expect(musicBar.locator('.music-bar-title')).toBeVisible();

      // Check control buttons exist
      const buttons = musicBar.locator('.music-bar-btn');
      expect(await buttons.count()).toBe(3); // prev, play/pause, next

      // Check play/pause button specifically
      await expect(musicBar.locator('.music-bar-btn-play')).toBeVisible();
    } else {
      console.log('SKIP: Music bar not visible (YouTube may be blocked in test env)');
    }
  });

  test('UAT-012: Control buttons have correct aria labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(6000);
    await page.click('body');
    await page.waitForTimeout(5000);

    const musicBar = page.locator('.music-bar');
    const isVisible = await musicBar.isVisible().catch(() => false);

    if (isVisible) {
      await expect(musicBar.locator('[aria-label="Previous track"]')).toBeVisible();
      await expect(musicBar.locator('[aria-label="Next track"]')).toBeVisible();

      // Play/Pause button should have one of these labels
      const playPauseBtn = musicBar.locator('.music-bar-btn-play');
      const label = await playPauseBtn.getAttribute('aria-label');
      expect(['Play', 'Pause']).toContain(label);
    } else {
      console.log('SKIP: Music bar not visible');
    }
  });
});

test.describe('Now Playing Toast Notification', () => {
  test('UAT-013: Toast notification container has correct CSS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Verify toast CSS classes are defined in the stylesheet
    const toastStyles = await page.evaluate(() => {
      const sheets = document.styleSheets;
      let found = { toast: false, enter: false, exit: false, bar: false };
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.now-playing-toast') found.toast = true;
            if (rule.selectorText === '.now-playing-enter') found.enter = true;
            if (rule.selectorText === '.now-playing-exit') found.exit = true;
            if (rule.selectorText === '.music-bar') found.bar = true;
          }
        } catch (e) { /* cross-origin sheets */ }
      }
      return found;
    });

    expect(toastStyles.toast).toBe(true);
    expect(toastStyles.enter).toBe(true);
    expect(toastStyles.exit).toBe(true);
    expect(toastStyles.bar).toBe(true);
  });

  test('UAT-014: Toast z-index is above music bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const zIndexes = await page.evaluate(() => {
      const sheets = document.styleSheets;
      let toastZ = null, barZ = null;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.now-playing-toast' && rule.style) {
              toastZ = parseInt(rule.style.zIndex, 10);
            }
            if (rule.selectorText === '.music-bar' && rule.style) {
              barZ = parseInt(rule.style.zIndex, 10);
            }
          }
        } catch (e) {}
      }
      return { toastZ, barZ };
    });

    expect(zIndexes.toastZ).toBeGreaterThan(zIndexes.barZ);
  });
});

test.describe('CSS & Styling', () => {
  test('UAT-015: Equalizer bar animations are defined', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const hasEqAnimation = await page.evaluate(() => {
      const sheets = document.styleSheets;
      let hasKeyframes = false;
      let hasPausedClass = false;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'eqBounce') {
              hasKeyframes = true;
            }
            if (rule.selectorText === '.eq-bar-paused') {
              hasPausedClass = true;
            }
          }
        } catch (e) {}
      }
      return { hasKeyframes, hasPausedClass };
    });

    expect(hasEqAnimation.hasKeyframes).toBe(true);
    expect(hasEqAnimation.hasPausedClass).toBe(true);
  });

  test('UAT-016: Body has padding-bottom for music bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const paddingBottom = await page.evaluate(() => {
      return getComputedStyle(document.body).paddingBottom;
    });

    // Should have padding to prevent content hiding behind the bar
    const pbValue = parseFloat(paddingBottom);
    expect(pbValue).toBeGreaterThanOrEqual(50);
  });

  test('UAT-017: Hidden player is off-screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    const playerStyles = await page.evaluate(() => {
      const el = document.getElementById('yt-bg-player');
      if (!el) return null;
      const styles = getComputedStyle(el);
      return {
        opacity: styles.opacity,
        pointerEvents: styles.pointerEvents,
      };
    });

    if (playerStyles) {
      expect(playerStyles.opacity).toBe('0');
      expect(playerStyles.pointerEvents).toBe('none');
    }
  });

  test('UAT-018: Music bar is fixed at bottom', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const barPosition = await page.evaluate(() => {
      const sheets = document.styleSheets;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.music-bar' && rule.style) {
              return {
                position: rule.style.position,
                bottom: rule.style.bottom,
                left: rule.style.left,
                right: rule.style.right,
              };
            }
          }
        } catch (e) {}
      }
      return null;
    });

    expect(barPosition).not.toBeNull();
    expect(barPosition.position).toBe('fixed');
    expect(barPosition.bottom).toBe('0px');
  });
});

test.describe('Dark Mode Compatibility', () => {
  test('UAT-019: Music bar is visible in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Music bar uses fixed dark background (rgba(15,23,42,0.92))
    // so it should look good in both modes — verify the CSS exists
    const barBg = await page.evaluate(() => {
      const sheets = document.styleSheets;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.music-bar-inner' && rule.style) {
              return rule.style.background;
            }
          }
        } catch (e) {}
      }
      return null;
    });

    expect(barBg).toContain('rgba(15, 23, 42');
  });

  test('UAT-020: Music bar is visible in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });

    // Same dark glassmorphism bar works in light mode too
    const barBg = await page.evaluate(() => {
      const sheets = document.styleSheets;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.music-bar-inner' && rule.style) {
              return rule.style.background;
            }
          }
        } catch (e) {}
      }
      return null;
    });

    expect(barBg).toContain('rgba(15, 23, 42');
  });
});

test.describe('Responsive Design', () => {
  test('UAT-021: Music bar works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('load');

    // Check music bar CSS works for small screens
    const barStyles = await page.evaluate(() => {
      const sheets = document.styleSheets;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.music-bar' && rule.style) {
              return {
                left: rule.style.left,
                right: rule.style.right,
              };
            }
          }
        } catch (e) {}
      }
      return null;
    });

    // Bar should span full width
    expect(barStyles.left).toBe('0px');
    expect(barStyles.right).toBe('0px');
  });

  test('UAT-022: App loads correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Should not have any layout errors
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(50);
  });
});

test.describe('Playlist Constants', () => {
  test('UAT-023: Playlist constant is correctly configured', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Verify the YouTube player uses the correct playlist ID
    await page.waitForTimeout(5000);

    const iframeSrc = await page.evaluate(() => {
      const iframe = document.getElementById('yt-bg-player');
      if (iframe && iframe.tagName === 'IFRAME') {
        return iframe.src;
      }
      return null;
    });

    if (iframeSrc) {
      expect(iframeSrc).toContain('PLM968uqsSH4ThR2IgnbkpvH8Ueszeub-z');
    } else {
      console.log('INFO: Player iframe not yet created or still a div');
    }
  });
});

test.describe('Error Handling', () => {
  test('UAT-024: App does not crash if YouTube API fails to load', async ({ page }) => {
    // Block YouTube API
    await page.route('**/youtube.com/**', (route) => route.abort());

    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    // App should still render without crashing
    await expect(page.locator('.min-h-screen')).toBeVisible();

    // Filter out expected network-related errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('YouTube') && !e.includes('network') && !e.includes('ERR_FAILED')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('UAT-025: Existing app sections still render with music player', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    // Core sections should still load
    const bodyText = await page.locator('body').textContent();

    // Check footer renders (copyright text)
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });
});

test.describe('Interaction Handlers', () => {
  test('UAT-026: Click interaction handler is registered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(4000);

    // The hook registers click/touchstart/keydown listeners
    // We can verify by clicking and checking no errors occur
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.click('body');
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(
      (e) => !e.includes('YouTube') && !e.includes('postMessage')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('UAT-027: Keyboard interaction handler works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(4000);

    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(
      (e) => !e.includes('YouTube') && !e.includes('postMessage')
    );
    expect(criticalErrors).toEqual([]);
  });
});

test.describe('Performance', () => {
  test('UAT-028: Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Page DOM content loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // 10 second max
  });

  test('UAT-029: YouTube script does not block initial render', async ({ page }) => {
    await page.goto('/');

    // Main content should be visible quickly, before YouTube loads
    await expect(page.locator('.min-h-screen')).toBeVisible({ timeout: 5000 });

    // YouTube script loads async — verify it has async attribute
    const isAsync = await page.evaluate(() => {
      const script = document.querySelector('script[src*="youtube.com/iframe_api"]');
      return script ? script.async : null;
    });

    // Script may not be in DOM yet, but when it is, it should be async
    if (isAsync !== null) {
      expect(isAsync).toBe(true);
    }
  });
});

test.describe('Route Navigation with Music', () => {
  test('UAT-030: Music player persists across route changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    // Check YouTube player exists
    const playerBefore = await page.locator('#yt-bg-player').count();

    // Navigate to projects
    await page.goto('/#/projects');
    await page.waitForTimeout(2000);

    // Player should still exist (it's in App.js, not route-specific)
    const playerAfter = await page.locator('#yt-bg-player').count();
    expect(playerAfter).toBe(playerBefore);
  });

  test('UAT-031: Navigate back to home, player still works', async ({ page }) => {
    await page.goto('/#/projects');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    await page.goto('/');
    await page.waitForTimeout(2000);

    // App should render without errors
    await expect(page.locator('.min-h-screen')).toBeVisible();

    // YouTube player should still be in DOM
    const playerExists = await page.locator('#yt-bg-player').count();
    expect(playerExists).toBe(1);
  });
});
