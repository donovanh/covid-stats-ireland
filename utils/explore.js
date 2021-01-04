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


  // Generate rolling 7-day average cases from today back

  const rolling7DayAvgCases = national.map((d, i) => {
    // For each day take the preceeding 6 days and produce average
    const vals = [];
    for (let j= 0; j < 7; j++) {
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

  console.log(rolling7DayAvgCases)

  // Put data into 7-day groups
  // let cohort = [];
  // const groups = data.national.reverse().reduce((acc, d, i) => {
  //   if (cohort.length === 0) {
  //     cohort.date = d.date;
  //   }
  //   if (cohort.length < 7) {
  //     cohort.push(d.ConfirmedCovidCases);

  //     if (i === data.national.length - 1) {
  //       acc.push(cohort);
  //     }
  //   } else {
  //     acc.push(cohort);
  //     cohort = [];
  //   }
  //   return acc;
  // }, []);

  // const sevenDayAverageNumbers = groups.reverse().map(group => {
  //   const sum = group.reduce((a, b) => a + b, 0);
  //   return sum / group.length;
  // });

  // // Add dates to the averages
  // const sevenDayAverages = sevenDayAverageNumbers.map((d, i) => {
  //   return {
  //     date: groups[i].date,
  //     value: d
  //   }
  // });

  // // console.log(groups)
  // console.log(sevenDayAverages)

};