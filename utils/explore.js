const fsPromises = require('fs').promises;
const puppeteer = require('puppeteer');
const CSV = require('csv-string');
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

  const vaccinationCSV = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Ireland.csv';
  const vaccinationResponse = await fetch(vaccinationCSV);
  const processed = processVaccinationData(await vaccinationResponse.text())
  console.log(processed)
};


const processVaccinationData = (data) => {
  const parsedData = CSV.parse(data);
  const result = [];
  for ([index, row] of parsedData.entries()) {
    if (index === 0) {
      continue;
    }
    if (row.length > 1) {
      result.push({
        date: new Date(row[1]),
        vaccineType: row[2],
        doses: +(row[4]),
        people: +(row[5]),
        fullyVaccinated: +(row[6])
      });
    }
  }

  // Vaccines began 29th Dec
  const firstDataPoint = {
    date: new Date('2020-12-29T00:00:00.000Z'),
    doses: 0,
    people: 0,
    fullyVaccinated: 0
  }
  result.unshift(firstDataPoint);

  let dataset = result.map((d, i) => {
    const prevDay = result[i - 1] ? result[i - 1] : {
      doses: 0,
      people: 0,
      fullyVaccinated: 0
    };
    const averages = {};
    const daysBetween = (new Date(d.date) - new Date(prevDay.date)) / (1000 * 3600 * 24) || 1;
    averages.dailyAvgDoses = Math.round((d.doses - prevDay.doses) / daysBetween);
    averages.dailyFullyVaccinated = Math.round((d.fullyVaccinated - prevDay.fullyVaccinated) / daysBetween);

    return {
      ...d,
      ...averages
    };
  });

  // const lastDataPoint = {
  //   ...dataset[dataset.length - 1],
  //   date: new Date()
  // }

  // dataset = [
  //   ...dataset,
  //   lastDataPoint
  // ];

  let tempArray = [];

  // Loop through the dates covered and fill in the gaps
  let currentDate = new Date(dataset[0].date).getTime();
  const lastDate = new Date(dataset[dataset.length - 1].date).getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  let i = 0;
  while(currentDate <= lastDate) {
    if (getForDate(currentDate, dataset) !== {}) {
      tempArray.push({
        date: currentDate
      })
    }
    
    currentDate += oneDay;
    
  }

  let currentItem = dataset[dataset.length - 1];

  const filledDates = tempArray.reverse().map(d => {
    if (getForDate(d.date, dataset).doses) {
      currentItem = getForDate(d.date, dataset);
    }
    return {
      dailyAvgDoses: currentItem.dailyAvgDoses,
      dailyFullyVaccinated: currentItem.dailyFullyVaccinated,
      date: d.date
    } 
  }).reverse();

  // Go through filled dates and add estimated
  // fully vaccinated between each
  const datesWithEstimate = [];
  filledDates.forEach((d, i) => {
    let estimatedFullyVaccinated = 0;
    let estimatedDoses = 0;
    if (i > 0) {
      const prevDay = datesWithEstimate[i - 1];
      estimatedFullyVaccinated = prevDay.estimatedFullyVaccinated + prevDay.dailyFullyVaccinated;
      estimatedDoses = prevDay.estimatedDoses + prevDay.dailyAvgDoses;
    }      
    datesWithEstimate.push({
      ...d,
      estimatedFullyVaccinated,
      estimatedDoses
    });
  });

  // Go through the filled dates and add in the current 
  // reported values per day
  currentItem = dataset[0];
  return datesWithEstimate.map(d => {
    if (getForDate(d.date, dataset).doses) {
      currentItem = getForDate(d.date, dataset);
    }
    return {
      ...d,
      ...currentItem,
      date: new Date(d.date)
    } 
  })
};

const getForDate = (date, dataset) => {
  const result = dataset.find(d => {
    const date1 = new Date(d.date);
    const compare1 = `${date1.getUTCFullYear()} ${date1.getUTCMonth()} ${date1.getUTCDate()}`;
    const date2 = new Date(date);
    const compare2 = `${date2.getUTCFullYear()} ${date2.getUTCMonth()} ${date2.getUTCDate()}`;
    return compare1 === compare2
  });
  return result || {};
}