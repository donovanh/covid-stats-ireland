const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('CNAME');
  eleventyConfig.addPassthroughCopy('img');

  // Filters
  eleventyConfig.addFilter('formatNumber', (number) => Intl.NumberFormat('en-UK').format(number));
  eleventyConfig.addFilter('formatDate', (date) => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', dateOptions);
  });

  eleventyConfig.on('afterBuild', async () => {
    if (process.env['NODE_ENV'] !== 'development') {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await sleep(200);
      await page.goto('http://localhost:8080/share-image/');
      await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
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