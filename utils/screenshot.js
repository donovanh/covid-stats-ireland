const puppeteer = require('puppeteer');

(async function() {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://hop.ie/covid-stats-ireland/');
  await page.screenshot({
    path: './_site/covid-stats-ireland.png',
    clip: {
      x: 0,
      y: 120,
      width: 800,
      height: 480
    }
  });
  console.log('Screenshot written');
  await browser.close();
})();