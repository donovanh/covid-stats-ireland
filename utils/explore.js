const fsPromises = require('fs').promises;

async function fetchData() {
  let data;
  try {
    return fsPromises.readFile('cached.json', 'utf-8');
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
  const national = data.national;
  const county = data.county;

  const agedTotals = (({
    Aged1,
    Aged5to14,
    Aged15to24,
    Aged25to34,
    Aged35to44,
    Aged45to54,
    Aged55to64,
    Aged65up
  }) => ({
    Aged1,
    Aged5to14,
    Aged15to24,
    Aged25to34,
    Aged35to44,
    Aged45to54,
    Aged55to64,
    Aged65up
  }))(national[national.length - 1]);

  const casesByAgeArray = Object.entries(agedTotals).map((entry) => ({
    age: entry[0]
      .replace('to', ' to ')
      .replace('Aged1', 'Under 5')
      .replace('Aged', '')
      .replace('1 to 55 to 24', '15 to 24')
      .replace('65up', '65 up')
      .replace('Under 55 to 24', '15 to 24'),
    value: entry[1]
  }));

  const hospitalTotals = (({
    HospitalisedAged5,
    HospitalisedAged5to14,
    HospitalisedAged15to24,
    HospitalisedAged25to34,
    HospitalisedAged35to44,
    HospitalisedAged45to54,
    HospitalisedAged55to64,
    HospitalisedAged65up
  }) => ({
    HospitalisedAged5,
    HospitalisedAged5to14,
    HospitalisedAged15to24,
    HospitalisedAged25to34,
    HospitalisedAged35to44,
    HospitalisedAged45to54,
    HospitalisedAged55to64,
    HospitalisedAged65up
  }))(national[national.length - 1]);

  const casesByHospitalisedArray = Object.entries(hospitalTotals).map((entry) => ({
    age: entry[0]
      .replace('HospitalisedAged5', 'Under 5')
      .replace('Under 5to14', '5to14')
      .replace('Under 55to64', '55to64')
      .replace('HospitalisedAged', '')
      .replace('to', ' to ')
      .replace('up', ' up'),
    value: entry[1]
  }));

  console.log(casesByAgeArray)
  console.log(casesByHospitalisedArray)
};