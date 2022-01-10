const puppeteer = require("puppeteer");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doScreenshot() {
  await sleep(1000);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:8080/share-image/");
  } catch (err) {
    doScreenshot();
    return;
  }
  await page.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
  });
  await page.screenshot({
    path: "./_site/covid-stats-ireland.png",
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 628,
    },
  });
  console.log("Screenshot written");
  await browser.close();
  console.log("Closing server");
  process.exit(0);
}

(async function () {
  await doScreenshot();
})();
