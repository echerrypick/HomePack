import { chromium } from "playwright";
import { type Browser } from "playwright";
import fs from "fs";
import { ensurePlaywrightChromium } from "./ofcomScraper";

export interface GenerationSignal {
  generation: string;
  signalDbm: string;
  quality: string;
  bands: string[];
}

export interface OperatorCoverage {
  operator: string;
  signals: GenerationSignal[];
  overall: string;
}

export interface CoverageResult {
  postcode: string;
  summary: string;
  operators: OperatorCoverage[];
  scrapedAt: string;
  source: string;
}

export async function scrapeCoverage(
  postcode: string,
  _houseNumber?: string
): Promise<CoverageResult> {
  console.log(`[Siginfo] Starting coverage scrape for postcode: ${postcode}`);

  let browser: Browser | null = null;

  try {
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-blink-features=AutomationControlled",
          "--disable-infobars",
          "--window-size=1280,900",
          "--single-process",
          "--no-zygote",
        ],
      });
    } catch (err: any) {
      if (err?.message && (err.message.includes("Executable doesn't exist") || err.message.includes("playwright install"))) {
        console.warn("[Siginfo] Playwright browser not found. Installing chromium now...");
        await ensurePlaywrightChromium();
        browser = await chromium.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--window-size=1280,900",
            "--single-process",
            "--no-zygote",
          ],
        });
      } else {
        throw err;
      }
    }

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      locale: "en-GB",
      timezoneId: "Europe/London",
      viewport: { width: 1280, height: 900 },
      extraHTTPHeaders: {
        'Accept-Language': 'en-GB,en;q=0.9',
      }
    });

    const page = await context.newPage();

    console.log(`[Siginfo] Step 1: Navigating to direct URL for postcode: ${postcode}`);
    const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, "");
    const directUrl = `https://siginfo.uk/report/${cleanPostcode}/`;
    
    try {
      await page.goto(directUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      
      const bodyText = await page.innerText('body');
      if (bodyText.includes("Not Found") || bodyText.includes("404")) {
        console.log("[Siginfo] Direct URL returned 404, falling back to home page...");
        await page.goto("https://siginfo.uk/", { waitUntil: "domcontentloaded", timeout: 30000 });
      }
    } catch (e) {
      console.log("[Siginfo] Direct URL navigation failed, falling back to home page...");
      await page.goto("https://siginfo.uk/", { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    
    // Wait for network to settle
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log("[Siginfo] Network did not go idle, continuing...");
    }

    // Handle cookie consent
    try {
      const cookieButton = page.locator('button:has-text("Accept"), button:has-text("Agree"), .cc-btn.cc-dismiss, #onetrust-accept-btn-handler');
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        console.log("[Siginfo] Dismissed cookie banner");
      }
    } catch (e) {}

    // Check if we are already on the results page or if we need to search
    const isResultsPage = await page.evaluate(() => {
      const grid = document.getElementById('operatorsGrid');
      return grid && grid.querySelectorAll('.operator-card').length > 0;
    });

    if (!isResultsPage) {
      console.log("[Siginfo] Not on results page, attempting manual search...");
      console.log(`[Siginfo] Step 2: Entering search term: ${postcode}`);
      
      // Try multiple selectors for the input
      const inputSelectors = ['#postcodeInput', 'input[placeholder*="postcode" i]', 'input[name*="postcode" i]', 'input[type="text"]'];
      let postcodeInput: any = null;
      
      for (const sel of inputSelectors) {
        try {
          const el = page.locator(sel).first();
          if (await el.isVisible({ timeout: 5000 })) {
            postcodeInput = el;
            break;
          }
        } catch (e) {}
      }
      
      if (!postcodeInput) {
        throw new Error("Could not find search input field on siginfo.uk.");
      }
      
      const searchTerm = _houseNumber ? `${postcode} ${_houseNumber}` : postcode;
      
      await postcodeInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Type with a delay to trigger site's validation
      await page.keyboard.type(searchTerm.toUpperCase().trim(), { delay: 100 });
      
      console.log("[Siginfo] Waiting for site to validate postcode...");
      await page.waitForTimeout(3000);

      console.log("[Siginfo] Step 3: Clicking Analyse button");
      const searchBtnSelector = '#searchBtn';
      
      try {
        // Wait for button to be enabled and loading to stop
        await page.waitForFunction(() => {
          const btn = document.getElementById('searchBtn') as HTMLButtonElement;
          const loading = document.getElementById('btnLoading');
          return btn && !btn.disabled && (!loading || loading.style.display === 'none');
        }, { timeout: 20000 });
        
        await page.click(searchBtnSelector);
        console.log("[Siginfo] Clicked Analyse button");
      } catch (e) {
        console.log("[Siginfo] Search button not ready, trying Enter key fallback...");
        await page.keyboard.press('Enter');
      }
    } else {
      console.log("[Siginfo] Direct URL landed on results page.");
    }

    console.log("[Siginfo] Step 4: Waiting for results...");
    try {
      const startTime = Date.now();
      let isDone = false;
      let lastLogTime = 0;
      const maxWaitTime = 120000; // Increase to 2 minutes
      
      while (Date.now() - startTime < maxWaitTime) {
        const state = await page.evaluate(() => {
          const grid = document.getElementById('operatorsGrid');
          const hasCards = grid && grid.querySelectorAll('.operator-card').length > 0;
          const title = document.getElementById('locationTitle');
          const titleText = title?.innerText || "";
          const error = document.getElementById('errorMessage');
          const hasError = error && error.style.display !== 'none' && error.innerText.length > 0;
          const bodyText = document.body.innerText;
          const is404 = bodyText.includes("Not Found") || bodyText.includes("404");
          return { hasCards, titleText, hasError, is404 };
        });
        
        if (state.hasCards || (state.titleText && state.titleText !== 'Loading...' && state.titleText !== '' && state.titleText.includes(postcode.toUpperCase()))) {
          console.log(`[Siginfo] Results detected: Title="${state.titleText}", HasCards=${state.hasCards}`);
          isDone = true;
          break;
        }
        
        if (state.hasError) {
          throw new Error(`Site error: ${await page.evaluate(() => document.getElementById('errorMessage')?.innerText)}`);
        }
        
        if (state.is404) {
          throw new Error("Page not found (404)");
        }
        
        // Log every 10 seconds if still waiting
        if (Date.now() - lastLogTime > 10000) {
          console.log(`[Siginfo] Still waiting for results... (Title="${state.titleText}", Time=${Math.round((Date.now() - startTime)/1000)}s)`);
          lastLogTime = Date.now();
        }
        
        await page.waitForTimeout(2000);
      }
      
      if (!isDone) {
        throw new Error("Timeout waiting for results after 120s");
      }
    } catch (e) {
      const html = await page.content();
      fs.writeFileSync('siginfo_timeout.html', html);
      throw new Error(`Timeout or error waiting for results for ${postcode}: ${e instanceof Error ? e.message : String(e)}`);
    }

    const bodyText = await page.innerText('body');
    if (bodyText.toLowerCase().includes("could not find") || bodyText.toLowerCase().includes("invalid postcode")) {
      throw new Error(`Postcode "${postcode.toUpperCase()}" not found.`);
    }

    console.log("[Siginfo] Step 5: Scraping results");
    const operators = await page.$$eval(".operator-card", (cards) => {
      return cards.map((card) => {
        const name = card.querySelector(".operator-name")?.textContent?.trim() || "Unknown";
        const quality = card.querySelector(".quality-badge")?.textContent?.trim() || "Unknown";
        
        const signals = Array.from(card.querySelectorAll(".generation-item")).map((item) => {
          const gen = item.querySelector(".gen-badge")?.textContent?.trim() || "";
          const dbm = item.querySelector(".signal-strength")?.textContent?.trim() || "";
          const q = item.querySelector(".quality-badge")?.textContent?.trim() || "";
          const bands = Array.from(item.querySelectorAll(".band-pill")).map(b => b.textContent?.trim() || "");
          return { generation: gen, signalDbm: dbm, quality: q, bands };
        });

        return { operator: name, signals, overall: quality };
      });
    });

    if (operators.length === 0) {
      throw new Error("No operator data found on page.");
    }

    const summary = await page.evaluate(() => {
      const header = Array.from(document.querySelectorAll('h1, h2, h3')).find(h => h.textContent?.includes('SUMMARY'));
      return header?.nextElementSibling?.textContent?.trim() || document.querySelector('.summary-quality')?.textContent?.trim() || "";
    });

    return {
      postcode: postcode.toUpperCase().trim(),
      summary,
      operators,
      scrapedAt: new Date().toISOString(),
      source: "siginfo.uk",
    };
  } finally {
    if (browser) await browser.close();
  }
}
