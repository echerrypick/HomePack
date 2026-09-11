
import { chromium } from 'playwright';
import fs from 'fs';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log('Navigating to siginfo.uk...');
    await page.goto('https://siginfo.uk/', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    fs.writeFileSync('siginfo_home.html', html);
    console.log('Saved siginfo_home.html');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
test();
