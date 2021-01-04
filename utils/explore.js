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
  const national = [...data.national];
  const county = [...data.county];
  const hospital = [...data.hospital];
  const icu = [...data.icu];
  const testing = [...data.testing];

  const rolling7DayAvgCases = national.map((d, i) => {
    // For each day take the preceeding 6 days and produce average
    const vals = [];
    for (let j = 0; j < 7; j++) {
      if (national[i - j]) {
        vals.push(national[i - j].ConfirmedCovidCases);
      }
    }
    const average = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      date: new Date(d.date),
      value: average
    }
  });

  const summary = {
    ...national[national.length - 1],
    previousConfirmedCovidCases: national[national.length - 2].ConfirmedCovidCases,
    avgCases: rolling7DayAvgCases[rolling7DayAvgCases.length - 1].value,
    previousAvgCases: rolling7DayAvgCases[rolling7DayAvgCases.length - 8].value,
    hospitalised: hospital[hospital.length - 1].hospitalisedCases,
    latestICU: icu[icu.length - 1].icuCases,
    testing: testing[testing.length - 1]
  };

  console.log(summary)


};