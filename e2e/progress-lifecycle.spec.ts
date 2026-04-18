import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Clean slate — no stored progress
  await context.clearCookies();
});

test('first-visit landing page has no ContinueLearning widget', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // ContinueLearning renders nothing when there is no progress in localStorage
  await expect(page.getByText('Continue where you left off')).toHaveCount(0);
  // Hero title visible — use first() to avoid strict mode violation with duplicate text
  await expect(page.getByText('Deep Learning with').first()).toBeVisible();
});

test('first-visit /modules shows no Your Progress panel', async ({ page }) => {
  await page.goto('/modules');
  await page.waitForLoadState('networkidle');
  // ProgressDashboard returns null when hasAnyProgress is false
  await expect(page.getByText('Your Progress')).toHaveCount(0);
});

test('seeding in-progress state shows ContinueLearning on landing', async ({ page }) => {
  // Seed localStorage before navigating so the page loads with the data
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('tf-course-progress', JSON.stringify({
      state: {
        modules: {
          '01-intro-deep-learning': {
            theoryRead: false,
            theoryScrollPercent: 0,
            labsCompleted: [],
            labsStarted: [],
            labAttempts: [],
            quizQuestionAttempts: [],
            quizPassed: false,
            quizAttempts: 0,
            quizScore: null,
            videoWatched: false,
            videoWatchedPercent: 0,
            videoFinishedAt: '',
            videoLastPosition: 0,
            videoWatchedSeconds: 0,
            lastAccessed: new Date().toISOString(),
            timeSpentMinutes: 5,
          },
        },
        overall: {
          totalTimeMinutes: 5,
          startedAt: new Date().toISOString(),
          lastSessionAt: new Date().toISOString(),
        },
        preferences: {
          videoPlaybackRate: 1,
          captionsDefault: false,
          lastTranscriptVisible: false,
        },
      },
      version: 0,
    }));
  });
  // Use fresh navigation (not reload) to avoid chunk errors
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Continue where you left off')).toBeVisible();
  // Since videoWatchedPercent is 0 and videoFinishedAt is empty, next action is "Watch the video"
  await expect(page.getByText('Watch the video')).toBeVisible();
});

test('seeding complete state shows CompletionBadge on module overview', async ({ page }) => {
  // Module 01-intro-deep-learning has labCount: 8
  const allLabs = Array.from({ length: 8 }, (_, i) => `lab-${String(i + 1).padStart(2, '0')}`);
  await page.goto('/');
  await page.evaluate((labs) => {
    localStorage.setItem('tf-course-progress', JSON.stringify({
      state: {
        modules: {
          '01-intro-deep-learning': {
            theoryRead: true,
            theoryScrollPercent: 100,
            labsCompleted: labs,
            labsStarted: labs,
            labAttempts: [],
            quizQuestionAttempts: [],
            quizPassed: true,
            quizScore: 90,
            quizAttempts: 1,
            videoWatched: true,
            videoWatchedPercent: 100,
            videoFinishedAt: new Date().toISOString(),
            videoLastPosition: 0,
            videoWatchedSeconds: 0,
            lastAccessed: new Date().toISOString(),
            timeSpentMinutes: 120,
          },
        },
        overall: {
          totalTimeMinutes: 120,
          startedAt: new Date().toISOString(),
          lastSessionAt: new Date().toISOString(),
        },
        preferences: {
          videoPlaybackRate: 1,
          captionsDefault: false,
          lastTranscriptVisible: false,
        },
      },
      version: 0,
    }));
  }, allLabs);
  await page.goto('/modules/01-intro-deep-learning');
  await page.waitForLoadState('networkidle');
  // CompletionBadge has role="status" aria-label="Module completed" and text "Module Complete"
  const badge = page.getByRole('status', { name: 'Module completed' });
  await expect(badge).toBeVisible({ timeout: 5000 });
  await expect(badge).toContainText('Module Complete');
});

test('ProgressDashboard appears on /modules with progress and is expandable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('tf-course-progress', JSON.stringify({
      state: {
        modules: {
          '02-neural-network-fundamentals': {
            theoryRead: true,
            theoryScrollPercent: 50,
            labsCompleted: ['lab-01'],
            labsStarted: ['lab-01'],
            labAttempts: [],
            quizQuestionAttempts: [],
            quizPassed: false,
            quizAttempts: 0,
            quizScore: null,
            videoWatched: false,
            videoWatchedPercent: 30,
            videoFinishedAt: '',
            videoLastPosition: 0,
            videoWatchedSeconds: 0,
            lastAccessed: new Date().toISOString(),
            timeSpentMinutes: 20,
          },
        },
        overall: {
          totalTimeMinutes: 20,
          startedAt: new Date().toISOString(),
          lastSessionAt: new Date().toISOString(),
        },
        preferences: {
          videoPlaybackRate: 1,
          captionsDefault: false,
          lastTranscriptVisible: false,
        },
      },
      version: 0,
    }));
  });
  await page.goto('/modules');
  await page.waitForLoadState('networkidle');
  // ProgressDashboard header button contains "Your Progress"
  await expect(page.getByText('Your Progress')).toBeVisible({ timeout: 5000 });
  // totalMinutes is 20, so "min spent" should appear
  await expect(page.getByText('min spent')).toBeVisible();
});

test('no hydration errors across landing + modules + module overview', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/modules');
  await page.waitForLoadState('networkidle');
  await page.goto('/modules/01-intro-deep-learning');
  await page.waitForLoadState('networkidle');

  const hydrationErrors = errors.filter((e) => /hydration/i.test(e));
  expect(hydrationErrors, hydrationErrors.join('\n')).toHaveLength(0);
});

test('search page loads and input is focusable', async ({ page }) => {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  // The search input uses type="search"
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible({ timeout: 5000 });
  await searchInput.fill('optimizer');
  await page.waitForTimeout(300); // debounce
  // The input should retain the value
  await expect(searchInput).toHaveValue('optimizer');
});
