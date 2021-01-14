function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(eleventyConfig) {
  // Output directory: _site
  // Copy `img/` to `_site/img`
  eleventyConfig.addPassthroughCopy("img");

  // eleventyConfig.on('afterBuild', async () => {
  //   console.log('Node: ', process.version);
  //   const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  //   const page = await browser.newPage();
  //   await sleep(200);
  //   await page.goto('http://localhost:8080');
  //   await page.screenshot({path: './_site/covid-stats-ireland.png'});
  //   console.log('Screenshot written');
  //   await browser.close();
  //   if (process.env['NODE_ENV'] !== 'development') {
  //     console.log('Closing server')
  //     process.exit(0);
  //   }
  // });
};