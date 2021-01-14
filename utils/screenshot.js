const puppeteer = require('puppeteer');

(async function() {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://hop.ie/covid-stats-ireland/');
  await page.screenshot({path: './img/covid-stats-ireland.png'});
  console.log('Screenshot written');
  await browser.close();
})();