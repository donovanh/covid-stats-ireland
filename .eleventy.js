const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(eleventyConfig) {
  // Output directory: _site
  // Copy `img/` to `_site/img`
  eleventyConfig.addPassthroughCopy("img");

  eleventyConfig.on('afterBuild', async () => {
    if (process.env['NODE_ENV'] !== 'development') {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await sleep(200);
      await page.goto('http://localhost:8080');
      const path = './_site/covid-stats-ireland.png';
      await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
      });
      await page.screenshot({
        path,
        clip: {
          x: 0,
          y: 70,
          width: 1200,
          height: 675
        }
      });
      console.log('Screenshot written');
      await browser.close();
      console.log('Closing server')
      process.exit(0);
    }
  });
};