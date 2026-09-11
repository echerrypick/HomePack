import { chromium, Page, Browser, BrowserContext } from 'playwright';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

let isInstallingChromium = false;
export async function ensurePlaywrightChromium(): Promise<void> {
  if (isInstallingChromium) return;
  isInstallingChromium = true;
  try {
    console.log('[Playwright] Auto-installing Playwright Chromium binary in background...');
    await execPromise('npx playwright install chromium');
    console.log('[Playwright] Chromium installation completed.');
  } catch (err: any) {
    console.error('[Playwright] Error installing chromium:', err.message);
  } finally {
    isInstallingChromium = false;
  }
}

let globalBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    try {
      globalBrowser = await chromium.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-size=1280,800'
        ]
      });
    } catch (err: any) {
      if (err?.message && (err.message.includes("Executable doesn't exist") || err.message.includes("playwright install"))) {
        console.warn("[OfcomScraper] Playwright browser not found. Installing chromium now...");
        await ensurePlaywrightChromium();
        globalBrowser = await chromium.launch({ 
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1280,800'
          ]
        });
      } else {
        throw err;
      }
    }
  }
  return globalBrowser;
}

async function setupPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  
  // Block unnecessary resources
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media', 'other'].includes(type)) {
      route.abort();
    } else if (type === 'script') {
      const url = route.request().url();
      // Block tracking and ads
      if (url.includes('google-analytics') || url.includes('googletagmanager') || url.includes('doubleclick') || url.includes('facebook')) {
        route.abort();
      } else {
        route.continue();
      }
    } else {
      route.continue();
    }
  });

  // Hide automation
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    (window as any).chrome = { runtime: {} };
    const originalQuery = window.navigator.permissions.query;
    (window.navigator.permissions as any).query = (parameters: any) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-GB', 'en-US', 'en'] });
  });

  return page;
}

async function handleCloudflare(page: Page) {
  const startTime = Date.now();
  const maxWait = 45000;
  
  while (Date.now() - startTime < maxWait) {
    const isChallenge = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("security verification") || 
             text.includes("verifying you are not a bot") || 
             text.includes("Checking your browser") || 
             text.includes("Just a moment");
    });
    
    if (!isChallenge) break;

    console.log("[OfcomScraper] Security challenge detected, waiting...");
    
    // Try to click Turnstile if visible
    const frames = page.frames();
    for (const frame of frames) {
      try {
        if (frame.url().includes('cloudflare')) {
          const checkbox = frame.locator('#challenge-stage, .ctp-checkbox-label').first();
          if (await checkbox.isVisible({ timeout: 500 })) {
            console.log("[OfcomScraper] Clicking Turnstile checkbox...");
            await checkbox.click();
          }
        }
      } catch (e) {}
    }
    
    await page.waitForTimeout(1000);
    
    if (Date.now() - startTime > 25000 && Date.now() - startTime < 27000) {
      console.log("[OfcomScraper] Challenge stuck, reloading...");
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }
}

export interface MobileProvider {
  operator: string;
  voice: string;
  data: string;
  fiveG: string;
  raw?: string;
}

export interface BroadbandResult {
  type: string;
  downloadSpeed: string;
  uploadSpeed: string;
  available: boolean;
}

export interface BroadbandLookupResult {
  success: boolean;
  error?: string;
  address?: string;
  postcode?: string;
  broadband: BroadbandResult[];
  networks: string[];
}

export interface MobileLookupResult {
  success: boolean;
  error?: string;
  postcode?: string;
  house_number?: string;
  street?: string;
  matched_address?: string;
  mobile?: MobileProvider[];
  addresses?: { id: string; address: string }[];
}

const URL = "https://checker.ofcom.org.uk/en-gb/mobile-coverage";

function normalizeText(value: string): string {
  return (value || "").toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function scoreAddress(candidate: string, houseNumber: string, street: string): number {
  const c = normalizeText(candidate);
  let score = 0;
  if (houseNumber && new RegExp(`\\b${normalizeText(houseNumber)}\\b`).test(c)) {
    score += 5;
  }
  if (street && c.includes(normalizeText(street))) {
    score += 5;
  }
  return score;
}

export async function lookupOfcomMobile(
  houseNumber: string,
  street: string,
  postcode: string,
  mode: 'lookup' | 'addresses' = 'lookup'
): Promise<MobileLookupResult> {
  console.log(`[OfcomScraper] Starting ${mode} for: ${houseNumber} ${street}, ${postcode}`);

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-GB",
    timezoneId: "Europe/London",
    extraHTTPHeaders: {
      'Accept-Language': 'en-GB,en;q=0.9',
    }
  });
  const page = await setupPage(context);

  try {
    const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, "");
    const URL = `https://checker.ofcom.org.uk/en-gb/mobile-coverage?postcode=${cleanPostcode}`;
    
    console.log(`[OfcomScraper] Navigating to ${URL}`);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await handleCloudflare(page);

    // Handle cookie consent
    try {
      const cookieBtn = page.locator("button:has-text('Accept'), button:has-text('Allow all'), #ccc-notify-accept, .cc-btn.cc-dismiss").first();
      if (await cookieBtn.isVisible({ timeout: 3000 })) {
        console.log("[OfcomScraper] Accepting cookies...");
        await cookieBtn.click();
      }
    } catch (e) {}

    console.log(`[OfcomScraper] Entering postcode: ${postcode}`);
    // Wait for the input to be available, checking iframes if needed
    const inputSelectors = [
      'input[placeholder*="postcode" i]',
      'input[name*="postcode" i]',
      'input[id*="postcode" i]',
      '#txt_postcode',
      '.postcode-input',
      'input[type="text"]'
    ];
    
    let postcodeInput: any = null;
    
    const findInput = async (root: any) => {
      for (const sel of inputSelectors) {
        try {
          const input = root.locator(sel).first();
          if (await input.isVisible({ timeout: 500 })) return input;
        } catch (e) {}
      }
      return null;
    };

    // Try multiple times with small delays
    for (let i = 0; i < 10; i++) {
      postcodeInput = await findInput(page);
      if (!postcodeInput) {
        const frames = page.frames();
        for (const frame of frames) {
          postcodeInput = await findInput(frame);
          if (postcodeInput) break;
        }
      }
      if (postcodeInput) break;
      await page.waitForTimeout(1000);
    }

    if (!postcodeInput) {
      const bodyText = await page.innerText("body");
      console.log("[OfcomScraper] Page content snippet:", bodyText.slice(0, 1000));
      // Save HTML for debugging
      fs.writeFileSync('ofcom_mobile_fail.html', await page.content());
      throw new Error("Could not find postcode input field");
    }

    await postcodeInput.fill(postcode.toUpperCase().trim());
    await page.waitForTimeout(200);
    await postcodeInput.press('Enter');

    console.log("[OfcomScraper] Clicking Search button...");
    try {
      const searchBtn = page.locator("button:has-text('Search'), button:has-text('Find'), .search-button, button[type='submit'], #search-button").first();
      await searchBtn.click({ timeout: 3000 });
    } catch (e) {
      // Fallback to checking frames if not found in main page
      const frames = page.frames();
      for (const frame of frames) {
        try {
          const btn = frame.locator("button:has-text('Search'), button:has-text('Find'), .search-button, button[type='submit'], #search-button").first();
          if (await btn.isVisible({ timeout: 500 })) {
            await btn.click();
            break;
          }
        } catch (e2) {}
      }
    }

    console.log("[OfcomScraper] Waiting for address selection UI...");
    let targetFrame: any = page;
    try {
      // Wait for either a select, a list, or a message saying no addresses in any frame
      await page.waitForFunction(() => {
        const check = (doc: Document) => {
          const text = doc.body.innerText;
          return text.includes("Select your address") || 
                 text.includes("No addresses found") || 
                 doc.querySelector('select') !== null ||
                 doc.querySelector('li') !== null ||
                 doc.querySelector("[role='option']") !== null;
        };
        if (check(document)) return true;
        const iframes = Array.from(document.querySelectorAll('iframe'));
        for (const f of iframes) {
          try {
            if (f.contentDocument && check(f.contentDocument)) return true;
          } catch (e) {}
        }
        return false;
      }, { timeout: 25000 });

      // Identify which frame has the UI
      const frames = page.frames();
      for (const frame of frames) {
        try {
          const hasSelect = await frame.locator("select").count() > 0;
          const hasList = await frame.locator("li, [role='option']").count() > 0;
          const hasText = (await frame.innerText("body")).includes("Select your address");
          if (hasSelect || hasList || hasText) {
            targetFrame = frame;
            break;
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error("[OfcomScraper] Timeout waiting for address selection UI");
      return { success: false, error: "Postcode not found or timed out waiting for addresses" };
    }

    // Check if "No addresses found" is visible in target frame
    if (await targetFrame.locator("text=No addresses found").isVisible({ timeout: 2000 })) {
      console.error("[OfcomScraper] Ofcom says: No addresses found for this postcode");
      return { success: false, error: "Ofcom reported no addresses for this postcode" };
    }

    // Wait a bit for the dropdown to be populated
    await page.waitForTimeout(2000);

    let matchedAddress = "";

    // Find address select/list in target frame
    const select = targetFrame.locator("select").first();
    if (await select.isVisible({ timeout: 5000 })) {
      console.log("[OfcomScraper] Dropdown found, reading options...");
      const options = (await select.locator("option").allTextContents())
        .map(t => t.trim())
        .filter(t => t && !t.toLowerCase().includes("select"));

      if (options.length === 0) {
        console.error("[OfcomScraper] No address options found in dropdown");
        return { success: false, error: "No address options found" };
      }

      if (mode === 'addresses') {
        return {
          success: true,
          addresses: options.map((opt, i) => ({ id: String(i), address: opt }))
        };
      }

      console.log(`[OfcomScraper] Found ${options.length} options in dropdown. Matching...`);
      const ranked = [...options].sort((a, b) => scoreAddress(b, houseNumber, street) - scoreAddress(a, houseNumber, street));
      matchedAddress = ranked[0];

      if (scoreAddress(matchedAddress, houseNumber, street) < 5) {
        console.warn(`[OfcomScraper] No confident match. Best guess: ${matchedAddress}`);
        return { success: false, error: "No confident address match" };
      }

      console.log(`[OfcomScraper] Matched address: ${matchedAddress}`);
      await select.selectOption({ label: matchedAddress });
    } else {
      // Fallback for custom list UIs
      console.log("[OfcomScraper] Dropdown not found, searching for list items...");
      let texts: string[] = [];
      const selectors = ["li", "button", "[role='option']", "label", "div"];
      for (const sel of selectors) {
        try {
          const content = await page.locator(sel).allTextContents();
          texts = [...texts, ...content];
        } catch (e) {}
      }

      const pcClean = postcode.replace(/\s+/g, "").toLowerCase();
      texts = texts.map(t => t.trim()).filter(t => t.replace(/\s+/g, "").toLowerCase().includes(pcClean));
      texts = Array.from(new Set(texts));

      if (texts.length === 0) {
        console.error("[OfcomScraper] No address candidates found in list");
        return { success: false, error: "No address candidates found" };
      }

      if (mode === 'addresses') {
        return {
          success: true,
          addresses: texts.map((txt, i) => ({ id: String(i), address: txt }))
        };
      }

      console.log(`[OfcomScraper] Found ${texts.length} candidates in list. Matching...`);
      const ranked = [...texts].sort((a, b) => scoreAddress(b, houseNumber, street) - scoreAddress(a, houseNumber, street));
      matchedAddress = ranked[0];

      if (scoreAddress(matchedAddress, houseNumber, street) < 5) {
        console.warn(`[OfcomScraper] No confident match. Best guess: ${matchedAddress}`);
        return { success: false, error: "No confident address match" };
      }

      console.log(`[OfcomScraper] Matched address: ${matchedAddress}`);
      await page.getByText(matchedAddress, { exact: false }).click();
    }

    console.log("[OfcomScraper] Clicking OK button...");
    await page.getByRole('button', { name: /^ok$/i }).click();

    console.log("[OfcomScraper] Waiting for results page...");
    try {
      await page.waitForSelector("text=Coverage, .results-header, [role='tablist']", { timeout: 30000 });
    } catch (e) {
      console.error("[OfcomScraper] Timeout waiting for results page");
      return { success: false, error: "Results page did not render in time" };
    }

    // Click Address tab if present
    console.log("[OfcomScraper] Checking for Address tab...");
    const addressTab = page.getByRole('tab', { name: /address/i });
    if (await addressTab.count() > 0) {
      console.log("[OfcomScraper] Clicking Address tab...");
      await addressTab.click();
      await page.waitForTimeout(1500);
    }

    console.log("[OfcomScraper] Scraping provider results...");
    const body = await page.locator("body").innerText();

    const providers: MobileProvider[] = [];
    const providerNames = ["EE", "O2", "Three", "Vodafone"];
    
    for (const name of providerNames) {
      const regex = new RegExp(`(${name}.*?)(?=EE|O2|Three|Vodafone|Check another|$)`, "is");
      const match = body.match(regex);
      const coverageRaw = match ? match[1].trim() : "";

      let voice = "Unknown";
      let data = "Unknown";
      let fiveG = "Unknown";

      if (coverageRaw) {
        const vMatch = coverageRaw.match(/Voice\s*[:\-]?\s*([^\n|]+)/i);
        const dMatch = coverageRaw.match(/Data\s*[:\-]?\s*([^\n|]+)/i);
        const fMatch = coverageRaw.match(/5G\s*[:\-]?\s*([^\n|]+)/i);

        voice = vMatch ? vMatch[1].trim() : (coverageRaw.toLowerCase().includes("voice") ? "Available" : "Unknown");
        data = dMatch ? dMatch[1].trim() : (coverageRaw.toLowerCase().includes("data") ? "Available" : "Unknown");
        fiveG = fMatch ? fMatch[1].trim() : (coverageRaw.toLowerCase().includes("5g") ? "Available" : "Unknown");

        if (voice === "Unknown" && data === "Unknown") {
          voice = coverageRaw.split('\n')[0];
        }
      }

      providers.push({
        operator: name,
        voice,
        data,
        fiveG,
        raw: coverageRaw.slice(0, 200)
      });
    }

    console.log("[OfcomScraper] Lookup complete.");
    return {
      success: true,
      postcode,
      house_number: houseNumber,
      street,
      matched_address: matchedAddress,
      mobile: providers
    };

  } catch (error: any) {
    console.error(`[OfcomScraper] Error during lookup: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

export async function lookupOfcomBroadband(
  houseNumber: string,
  street: string,
  postcode: string,
  mode: 'lookup' | 'addresses' = 'lookup'
): Promise<any> {
  const pcNoSpaces = postcode.toUpperCase().replace(/\s+/g, "");
  const url = `https://checker.ofcom.org.uk/en-gb/broadband-coverage`;
  console.log(`[OfcomScraper] Starting broadband ${mode} for: ${houseNumber} ${street}, ${postcode}`);

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-GB",
    timezoneId: "Europe/London",
    extraHTTPHeaders: {
      'Accept-Language': 'en-GB,en;q=0.9',
    }
  });
  const page = await setupPage(context);

  try {
    console.log(`[OfcomScraper] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await handleCloudflare(page);

    // Handle cookie consent
    try {
      const cookieBtn = page.locator("button:has-text('Accept'), button:has-text('Allow all'), #ccc-notify-accept, .cc-btn.cc-dismiss").first();
      if (await cookieBtn.isVisible({ timeout: 3000 })) {
        console.log("[OfcomScraper] Accepting cookies...");
        await cookieBtn.click();
      }
    } catch (e) {}

    // 2. enter postcode in postcode field
    console.log(`[OfcomScraper] Entering postcode: ${postcode}`);
    const postcodeField = page.locator('#txt_postcode');
    await postcodeField.waitFor({ state: 'visible', timeout: 10000 });
    await postcodeField.fill(postcode.toUpperCase().trim());
    await page.waitForTimeout(500);

    // 2. press the "Set postcode" button
    console.log("[OfcomScraper] Clicking 'Set postcode' button...");
    const setPostcodeBtn = page.locator("button.change-location[data-action='broadband']");
    await setPostcodeBtn.waitFor({ state: 'visible', timeout: 5000 });
    
    // Try multiple click methods
    try {
      await setPostcodeBtn.click({ force: true });
    } catch (e) {
      console.log("[OfcomScraper] Force click failed, trying evaluate...");
      await page.evaluate(() => {
        const btn = document.querySelector("button.change-location[data-action='broadband']") as HTMLElement;
        if (btn) btn.click();
      });
    }
    await page.waitForTimeout(5000);

    // 3. wait for address list to appear
    console.log("[OfcomScraper] Waiting for address selection UI...");
    const targetFrame = page;
    
    try {
      // Wait for "Loading..." to appear then disappear
      try {
        await page.waitForSelector("text=Loading...", { timeout: 5000 });
        console.log("[OfcomScraper] Loading indicator detected, waiting for it to disappear...");
        await page.waitForSelector("text=Loading...", { state: 'hidden', timeout: 30000 });
      } catch (e) {}

      // Wait for the address select to appear in the main page
      await page.waitForSelector('#postcode_address', { timeout: 30000 });
      console.log("[OfcomScraper] Address selection UI detected.");
      
      // Wait for options to be populated
      await page.waitForFunction(() => {
        const select = document.querySelector('#postcode_address') as HTMLSelectElement;
        return select && select.options.length > 1;
      }, { timeout: 30000 });
      console.log("[OfcomScraper] Address options populated.");
    } catch (e) {
      console.error("[OfcomScraper] Timeout waiting for address selection UI");
      
      // Capture more debugging info
      const bodyText = await page.innerText("body");
      console.log("[OfcomScraper] Page text snippet (first 2000 chars):", bodyText.slice(0, 2000));
      
      fs.writeFileSync('ofcom_broadband_address_timeout.html', await page.content());
      return { success: false, error: "Postcode not found or timed out waiting for addresses", broadband: [], networks: [] };
    }

    // 4. select the address from the pull down list that becomes available
    let matchedAddress = "";
    const select = targetFrame.locator("select").first();
    let selectVisible = false;
    try {
      // Wait for the select to exist and have options
      await select.waitFor({ state: 'attached', timeout: 10000 });
      
      // Check if it has options
      const optionCount = await select.locator("option").count();
      if (optionCount > 1) {
        selectVisible = true;
      } else {
        console.log(`[OfcomScraper] Select found but only has ${optionCount} options. Waiting for population...`);
        // Wait a bit for population
        await page.waitForTimeout(2000);
        const newOptionCount = await select.locator("option").count();
        if (newOptionCount > 1) selectVisible = true;
      }
    } catch (e) {
      console.log(`[OfcomScraper] Select detection failed: ${e}`);
    }

    if (selectVisible) {
      const options = (await select.locator("option").allTextContents())
        .map(t => t.trim())
        .filter(t => t && !t.toLowerCase().includes("select"));

      if (options.length === 0) {
        return { success: false, error: "No address options found", broadband: [], networks: [] };
      }

      if (mode === 'addresses') {
        return {
          success: true,
          addresses: options.map((opt, i) => ({ id: String(i), address: opt }))
        };
      }

      const ranked = [...options].sort((a, b) => scoreAddress(b, houseNumber, street) - scoreAddress(a, houseNumber, street));
      matchedAddress = ranked[0];
      console.log(`[OfcomScraper] Selecting address: ${matchedAddress}`);
      
      const selectLocator = targetFrame.locator('select').first();
      await selectLocator.selectOption({ label: matchedAddress });
      console.log("[OfcomScraper] Address selected, waiting for potential refresh or results...");
      
      // Check if results appear immediately (some versions refresh on select)
      try {
        await page.waitForFunction(() => document.body.innerText.includes("Results for") || document.body.innerText.includes("Broadband"), { timeout: 5000 });
        console.log("[OfcomScraper] Results appeared immediately after selection.");
      } catch (e) {
        console.log("[OfcomScraper] Results did not appear immediately, attempting to click Submit button...");
        const submitBtn = targetFrame.locator("button:has-text('Submit'), input[type='submit'], button:has-text('View results'), button:has-text('Show coverage')").first();
        try {
          await submitBtn.click({ timeout: 3000, force: true });
          console.log("[OfcomScraper] Clicked Submit button.");
        } catch (e2) {
          console.log("[OfcomScraper] Submit button click (locator) timed out, attempting evaluate click fallback...");
          try {
            const clicked = await targetFrame.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
              const btn = buttons.find(b => {
                const text = (b instanceof HTMLInputElement ? b.value : b.textContent || "").toLowerCase();
                return text.includes('submit') || text.includes('view results') || text.includes('show coverage');
              });
              if (btn) {
                (btn as HTMLElement).click();
                return true;
              }
              return false;
            });
            if (clicked) {
              console.log("[OfcomScraper] Clicked Submit button via evaluate.");
            } else {
              throw new Error("Submit button not found via evaluate");
            }
          } catch (e3) {
            console.log("[OfcomScraper] All Submit button click methods failed, attempting Enter key fallback...");
            await page.keyboard.press('Enter');
          }
        }
      }
    } else {
      // Fallback for non-select list UIs
      let texts: string[] = [];
      const selectors = ["li", "button", "[role='option']", "div", "span"];
      for (const sel of selectors) {
        try {
          const content = await targetFrame.locator(sel).allTextContents();
          texts = [...texts, ...content];
        } catch (e) {}
      }
      
      const pcClean = postcode.replace(/\s+/g, "").toLowerCase();
      const filtered = texts.map(t => t.trim()).filter(t => {
        if (t.length < 5 || t.length > 150) return false; 
        if (t.toLowerCase().includes("broadband has download speeds")) return false;
        if (t.toLowerCase().includes("select your address")) return false;
        
        const cleanT = t.replace(/\s+/g, "").toLowerCase();
        return cleanT.includes(pcClean) || (/\d+/.test(t) && t.split(',').length > 1);
      });
      
      texts = Array.from(new Set(filtered));
      if (texts.length === 0) {
        return { success: false, error: "No address candidates found", broadband: [], networks: [] };
      }

      if (mode === 'addresses') {
        return {
          success: true,
          addresses: texts.map((txt, i) => ({ id: String(i), address: txt }))
        };
      }

      const ranked = [...texts].sort((a, b) => scoreAddress(b, houseNumber, street) - scoreAddress(a, houseNumber, street));
      matchedAddress = ranked[0];
      console.log(`[OfcomScraper] Clicking address: ${matchedAddress}`);
      await targetFrame.getByText(matchedAddress, { exact: false }).click();
      
      console.log("[OfcomScraper] Address clicked, waiting for potential refresh or results...");
      try {
        await page.waitForFunction(() => document.body.innerText.includes("Results for") || document.body.innerText.includes("Broadband"), { timeout: 5000 });
        console.log("[OfcomScraper] Results appeared immediately after clicking address.");
      } catch (e) {
        console.log("[OfcomScraper] Results did not appear immediately, attempting to click Submit button...");
        const submitBtnFallback = targetFrame.locator("button:has-text('Submit'), input[type='submit'], button:has-text('View results'), button:has-text('Show coverage')").first();
        try {
          await submitBtnFallback.click({ timeout: 3000, force: true });
          console.log("[OfcomScraper] Clicked Submit button.");
        } catch (e2) {
          console.log("[OfcomScraper] Submit button click (locator) timed out, attempting evaluate click fallback...");
          try {
            const clicked = await targetFrame.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
              const btn = buttons.find(b => {
                const text = (b instanceof HTMLInputElement ? b.value : b.textContent || "").toLowerCase();
                return text.includes('submit') || text.includes('view results') || text.includes('show coverage');
              });
              if (btn) {
                (btn as HTMLElement).click();
                return true;
              }
              return false;
            });
            if (clicked) {
              console.log("[OfcomScraper] Clicked Submit button via evaluate.");
            } else {
              throw new Error("Submit button not found via evaluate");
            }
          } catch (e3) {
            console.log("[OfcomScraper] All Submit button click methods failed, attempting Enter key fallback...");
            await page.keyboard.press('Enter');
          }
        }
      }
    }

    // 4. wait for page to load results
    console.log("[OfcomScraper] Waiting for results page...");
    let resultsFrame = targetFrame;
    try {
      await page.waitForFunction(() => document.body.innerText.includes("Results for") || document.body.innerText.includes("Broadband"), { timeout: 45000 });
      console.log("[OfcomScraper] Results detected in main page via innerText.");
      resultsFrame = page;
    } catch (e) {
      try {
        await targetFrame.waitForFunction(() => document.body.innerText.includes("Results for") || document.body.innerText.includes("Broadband"), { timeout: 10000 });
        console.log("[OfcomScraper] Results detected in targetFrame via innerText.");
      } catch (e2) {
        console.log("[OfcomScraper] Results page timeout. Page text snippet:", (await page.innerText("body")).slice(0, 1000));
        return { success: false, error: "Results page did not render in time", broadband: [], networks: [] };
      }
    }

    // Give it a moment to fully populate
    await page.waitForTimeout(2000);

    // 5. scrape the broadband data to show
    console.log("[OfcomScraper] Scraping broadband results...");
    const results = await resultsFrame.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, .broadband-row, .coverage-row, div[role="row"]'));
      const data: any[] = [];
      
      const types = ['Standard', 'Superfast', 'Ultrafast'];
      
      types.forEach(type => {
        const row = rows.find(r => r.textContent?.includes(type));
        if (row) {
          const cells = Array.from(row.querySelectorAll('td, .cell, div[role="cell"]'));
          // In some layouts, the speeds are in the 2nd and 3rd cells
          const download = cells[1]?.textContent?.trim() || "N/A";
          const upload = cells[2]?.textContent?.trim() || "N/A";
          const available = !row.textContent?.toLowerCase().includes('not available');
          data.push({ type, downloadSpeed: download, uploadSpeed: upload, available });
        } else {
          // Try to find by text if rows are not clear
          const allText = document.body.innerText;
          if (allText.includes(type)) {
            data.push({ type, downloadSpeed: "Available", uploadSpeed: "Available", available: true });
          } else {
            data.push({ type, downloadSpeed: "N/A", uploadSpeed: "N/A", available: false });
          }
        }
      });
      
      return data;
    });

    const networks = await resultsFrame.evaluate(() => {
      const providersSection = Array.from(document.querySelectorAll('h3, h4, .section-title, b, strong')).find(el => el.textContent?.includes('Providers') || el.textContent?.includes('Networks'));
      if (providersSection) {
        const nextEl = providersSection.parentElement?.innerText || "";
        // This is a bit loose, but we try to find names
        const commonProviders = ['Openreach', 'Virgin Media', 'CityFibre', 'Gigaclear', 'Hyperoptic', 'Community Fibre'];
        return commonProviders.filter(p => nextEl.includes(p));
      }
      return [];
    });

    console.log("[OfcomScraper] Broadband lookup complete.");
    return {
      success: true,
      address: matchedAddress,
      postcode,
      broadband: results,
      networks
    };

  } catch (error: any) {
    console.error(`[OfcomScraper] Broadband Error: ${error.message}`);
    return { success: false, error: error.message, broadband: [], networks: [] };
  } finally {
    await context.close();
  }
}
