import { test, expect } from '@playwright/test';

// Use a shared hook for authenticated pages
test.beforeEach(async ({ page }) => {
    // Mock the authenticated session
    await page.route('/api/auth/session', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: { name: 'Soprano User', email: 'test@example.com', role: 'CORALISTA' },
                expires: new Date(Date.now() + 2 * 86400).toISOString(),
            }),
        });
    });

    // Mock the specific work API so the page doesn't crash
    await page.route('**/api/v1/works/test-work-1', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'test-work-1',
                title: 'O Magnum Mysterium',
                composer: 'Tomas Luis de Victoria',
                pdf_url: null,
                editions: [
                    {
                        id: 'ed-1',
                        publisher: 'Test Publisher',
                        assets: [
                            { id: '1', name: 'Soprano', asset_type: 'MIDI_SOPRANO' },
                            { id: '2', name: 'Alto', asset_type: 'MIDI_ALTO' },
                            { id: '3', name: 'Tenor', asset_type: 'MIDI_TENOR' },
                            { id: '4', name: 'Bajo', asset_type: 'MIDI_BASS' }
                        ]
                    }
                ]
            }),
        });
    });
});

test.describe('Rehearsal Panel (3-Zone Layout & Voice Mixer)', () => {

    test('Loads the 3-zone Rehearsal Panel layout with Voice Mixer', async ({ page }) => {
        // We go directly to a work page, and simulate entering "Study Mode"
        await page.goto('/library/test-work-1');

        // Wait for the work detail to load
        await expect(page.getByText('O Magnum Mysterium').first()).toBeVisible();

        // Click the play button next to the first MIDI asset to enter Study Mode
        // The button has a title="Iniciar práctica con metrónomo"
        const rehearseBtn = page.locator('button[title="Iniciar práctica con metrónomo"]').first();
        await rehearseBtn.click();

        // 1. Check Header Zone (Title should be visible within the header)
        // Usually, the header is an h1 in the overlay
        const overlayTitle = page.locator('h1', { hasText: 'O Magnum Mysterium' }).last();
        await expect(overlayTitle).toBeVisible();

        // 2. Check Central Zone (PDF Viewer mock)
        // Usually contains "Partitura no disponible" or something if PDF is missing
        await expect(page.getByText('Partitura no disponible')).toBeVisible();

        // 3. Check Control Bar Zone (Voice Mixer)
        // Check for the existence of the 4 standard voices
        const mixerLabels = ['Soprano', 'Alto', 'Tenor', 'Bajo'];
        for (const label of mixerLabels) {
            // Check that the label exists in the document, ignore case, match substring
            const labelLoc = page.locator('div', { hasText: new RegExp(label, 'i') }).last();
            await expect(labelLoc).toBeVisible();
        }

        // Verify that there are visual indicators for the voices (the vertical bars)
        const voiceBars = page.locator('div[style*="height:"]');
        expect(await voiceBars.count()).toBeGreaterThanOrEqual(4);

        // Check for the Play/Pause button in the bottom control bar
        const playBtn = page.locator('footer button').first();
        await expect(playBtn).toBeVisible();
    });

});
