const fsPromises = require('fs').promises;

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
function doStuff(data) {
  // console.log('Got data', data)
  const {
    national,
    county,
    hospital,
    icu,
    testing
  } = data;

  console.log(JSON.stringify(county))

};