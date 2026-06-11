// Dev-only visual verification: full-page mobile screenshots of key screens.
// Usage: node verify-shot.mjs
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.TEMP || '.';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

async function captureFullPage(url, name, { scrollFirst = true } = {}) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  if (scrollFirst) {
    // Walk the page so IntersectionObserver reveals fire everywhere
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 900));
  }

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`saved ${name}`);
}

await captureFullPage('http://localhost:5173/', 'shot_welcome');

// Pricing screen: click "Choose Your Own Price"
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 800));
const buttons = await page.$$('button');
for (const b of buttons) {
  const text = await b.evaluate((el) => el.textContent);
  if (text.includes('Choose Your Own Price')) {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/shot_pricing.png`, fullPage: true });
console.log('saved shot_pricing');

await browser.close();
