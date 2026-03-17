import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Mock the authenticated session
    await page.route('/api/auth/session', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: { name: 'Student', email: 'test@example.com', role: 'CORALISTA' },
                expires: new Date(Date.now() + 2 * 86400).toISOString(),
            }),
        });
    });

    // Mock the academy dashboard data
    await page.route('**/api/v1/academy/dashboard', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                total_lessons: 5,
                completed_lessons: 2,
                current_lesson_id: 'lesson-3',
                lessons: [
                    { id: 'lesson-1', title: 'Intro al Ritmo', description: '...', lesson_type: 'RHYTHM' },
                    { id: 'lesson-2', title: 'Figuras Musicales', description: '...', lesson_type: 'THEORY' },
                    { id: 'lesson-3', title: 'El Compás de 4/4', description: 'Current lesson...', lesson_type: 'RHYTHM' },
                    // Locked lessons
                    { id: 'lesson-4', title: 'Lectura Rítmica Básica', description: '...', lesson_type: 'RHYTHM' },
                    { id: 'lesson-5', title: 'Las Notas en el Pentagrama', description: '...', lesson_type: 'THEORY' },
                ]
            }),
        });
    });
});

test.describe('Academy Dashboard (Phase 6 UI)', () => {

    test('Renders Academy Header with correct progress calculation', async ({ page }) => {
        await page.goto('/academy');

        // Check for the main heading with standard typography
        await expect(page.getByRole('heading', { level: 1, name: 'Tu Camino de Aprendizaje' })).toBeVisible();

        // Check the progress indicator (2 completed / 5 total = 40%)
        const progressPercentage = page.locator('span', { hasText: '40%' });
        await expect(progressPercentage).toBeVisible();

        const completedText = page.locator('span', { hasText: '2 / 5' });
        await expect(completedText).toBeVisible();
    });

    test('Lesson Cards apply Semantic UI appropriately (Completed vs Locked)', async ({ page }) => {
        await page.goto('/academy');

        // Check Lesson 1 (Completed)
        const lesson1 = page.locator('a[href="/academy/lesson-1"]');
        await expect(lesson1).toBeVisible();
        await expect(lesson1).toContainText('Intro al Ritmo');
        await expect(lesson1).toContainText('Repasar'); // Should show 'Repasar' for completed lessons

        // Check Lesson 3 (Current/Unlocked)
        const lesson3 = page.locator('a[href="/academy/lesson-3"]');
        await expect(lesson3).toBeVisible();
        await expect(lesson3).toContainText('El Compás de 4/4');
        await expect(lesson3).toContainText('Comenzar'); // Should show 'Comenzar' for the current lesson

        // Check Lesson 4 (Locked)
        // Locked lessons have href="#"
        const lockedLessons = page.locator('a[href="#"]');
        expect(await lockedLessons.count()).toBe(2);

        // Let's verify the opacity class is applied to a locked lesson
        const lesson4 = lockedLessons.first();
        await expect(lesson4).toContainText('Lectura Rítmica Básica');

        // Assert it has the 'opacity-60' or 'cursor-not-allowed' class indicative of locked state
        await expect(lesson4).toHaveClass(/cursor-not-allowed/);
    });

});
