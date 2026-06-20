import puppeteer from 'puppeteer';

const baseUrl = 'http://127.0.0.1:8765/site/index.html';
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop HD', width: 1280, height: 720 },
  { name: 'Desktop FHD', width: 1920, height: 1080 },
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];

for (const vp of viewports) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  const checks = await page.evaluate(() => {
    const skipLink = document.querySelector('.skip-link');
    const menuToggle = document.getElementById('menu-toggle');
    const hero = document.querySelector('.hero-title');
    const form = document.getElementById('whatsapp-form');
    const float = document.getElementById('whatsapp-float');
    const faq = document.querySelector('.faq-item');
    const heroRect = hero ? hero.getBoundingClientRect() : null;

    return {
      skipLink: !!skipLink,
      menuToggleVisible: menuToggle ? getComputedStyle(menuToggle).display !== 'none' : false,
      heroAboveFold: heroRect ? heroRect.top < window.innerHeight : false,
      formExists: !!form,
      floatExists: !!float,
      faqExists: !!faq,
      lang: document.documentElement.lang,
      mainLandmark: !!document.querySelector('main'),
    };
  });

  results.push({ viewport: vp.name, resolution: `${vp.width}×${vp.height}`, ...checks, status: '✅' });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
