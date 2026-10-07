import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { makePdfBuffer } from './fixtures';

test.describe('Merge PDF — client-side', () => {
  test('merges two PDFs entirely in the browser and downloads a 5-page result', async ({
    page,
  }) => {
    const a = await makePdfBuffer(2, 'A');
    const b = await makePdfBuffer(3, 'B');

    // No upload request should ever be made for a client-side tool.
    let uploadAttempted = false;
    page.on('request', (req) => {
      if (/\/uploads\/sign|\/jobs\b/.test(req.url())) uploadAttempted = true;
    });

    await page.goto('/merge-pdf');

    // The privacy promise must be visible.
    await expect(page.getByText(/processed locally/i)).toBeVisible();

    await page.locator('input[type=file]').setInputFiles([
      { name: 'a.pdf', mimeType: 'application/pdf', buffer: a },
      { name: 'b.pdf', mimeType: 'application/pdf', buffer: b },
    ]);

    await expect(page.locator('[data-testid=merge-row]')).toHaveCount(2);

    await page.locator('[data-testid=merge-run]').click();
    await expect(page.locator('[data-testid=download-result]')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid=download-result]').click(),
    ]);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const merged = Buffer.concat(chunks);

    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(5);

    // Confirm nothing was uploaded.
    expect(uploadAttempted).toBe(false);
  });

  test('rejects a non-PDF file with an error', async ({ page }) => {
    await page.goto('/merge-pdf');
    await page.locator('input[type=file]').setInputFiles([
      { name: 'evil.pdf', mimeType: 'application/pdf', buffer: Buffer.from([1, 2, 3, 4]) },
    ]);
    await expect(page.getByText(/not a valid pdf/i)).toBeVisible();
  });
});
