const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("img");
  
  eleventyConfig.on('afterBuild', async () => {
    if (process.env['NODE_ENV'] !== 'development') {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await sleep(200);
      await page.goto('http://localhost:8080/share-image/');
      await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 2,
      });
      await page.screenshot({
        path: './_site/covid-stats-ireland.png',
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 628
        }
      });
      console.log('Screenshot written');
      await browser.close();
      console.log('Closing server')
      process.exit(0);
    }
  });
};