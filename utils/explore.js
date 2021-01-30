const fsPromises = require('fs').promises;
const puppeteer = require('puppeteer');
const fetch = require('make-fetch-happen').defaults({
  cacheManager: './my-cache' // path where cache will be written (and read)
});

async function fetchData() {
  let data;
  try {
    return fsPromises.readFile('../cached.json', 'utf-8');
    data = JSON.parse(filecontent);
    console.log('Read data file');
  } catch (err) {
    console.log(err)
  }
}

// Fetch data from static file
const data = fetchData().then(data => doStuff(JSON.parse(data)));

// Do stuff to it!
async function doStuff(data) {
  // console.log('Got data', data)
  const {
    national,
    county,
    hospital,
    icu,
    testing,
    vaccination
  } = data;

  const getIrelandPop = async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto('https://www.worldometers.info/world-population/ireland-population/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.maincounter-number');
    const res = await page.evaluate(el => el.innerHTML, await page.$('.maincounter-number'));
    const irelandPop = res
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/,/g, '')
      .trim();
    await browser.close();
    return { irelandPop: parseInt(irelandPop) };
  };

  const irelandPop = await getIrelandPop();
  console.log(irelandPop)

};

