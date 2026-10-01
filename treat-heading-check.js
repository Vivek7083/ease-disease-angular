const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console.error: ' + msg.text()); });
  await page.goto('http://localhost:4300', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('treat')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'treat-heading-start.png' });

  await page.evaluate(() => window.scrollBy(0, 1800));
  await page.waitForTimeout(150);

  const info = await page.evaluate(() => {
    const viewport = document.querySelector('.treat-viewport-desktop');
    const vRect = viewport.getBoundingClientRect();
    const heading = document.querySelector('.treat-viewport-desktop .treat-heading-row');
    const node = document.querySelector('.treat-node:last-child .treat-laptop');
    const hRect = heading.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    return {
      viewportBottom: vRect.bottom,
      headingTop: hRect.top,
      headingBottom: hRect.bottom,
      nodeBottom: nRect.bottom,
      clipped: nRect.bottom > vRect.bottom,
      clipAmount: Math.max(0, nRect.bottom - vRect.bottom),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'treat-heading-end.png' });

  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
