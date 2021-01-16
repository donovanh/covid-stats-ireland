const puppeteer = require('puppeteer');

(async function() {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://hop.ie/covid-stats-ireland/');
  await page.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
  });
  await page.screenshot({
    path: './_site/covid-stats-ireland.png',
    clip: {
      x: 0,
      y: 70,
      width: 1200,
      height: 675
    }
  });
  console.log('Screenshot written');
  await browser.close();
})();