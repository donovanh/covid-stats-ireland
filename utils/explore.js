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
    testing,
    vaccination
  } = data;
  // Vaccines began 29th Dec
  // const firstDataPoint = {
  //   date: '2020-12-29T00:00:00.000Z',
  //   doses: 0,
  //   people: 0,
  //   fullyVaccinated: 0
  // }
  // vaccination.unshift(firstDataPoint);

  // // Vaccination into an array with an estimated daily value
  // const processedVaccination = vaccination.map((d, i) => {
  //   const prevDay = vaccination[i - 1] ? vaccination[i - 1] : {
  //     doses: 0,
  //     people: 0,
  //     fullyVaccinated: 0
  //   };
  //   const averages = {};
  //   const daysBetween = (new Date(d.date) - new Date(prevDay.date)) / (1000 * 3600 * 24) || 1;
  //   averages.dailyAvgDoses = Math.round((d.doses - prevDay.doses) / daysBetween);
  //   averages.dailyAvgPeople = Math.round((d.people - prevDay.people) / daysBetween);
  //   averages.dailyAvgFullyVaccinated = Math.round((d.fullyVaccinated - prevDay.fullyVaccinated) / daysBetween);
    
  //   return {
  //     ...d,
  //     ...averages
  //   };
  //});

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
  
  let dataset = vaccination;

  let tempArray = [];

  // Loop through the dates covered and fill in the gaps
  let currentDate = new Date(dataset[0].date).getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  let i = 0;
  while(currentDate < new Date().getTime()) {
    if (getForDate(currentDate, dataset) !== {}) {
      tempArray.push({
        date: currentDate
      })
    }
    
    currentDate += oneDay;
    
  }

  let currentItem = dataset[dataset.length - 1];

  const updatedDataset = tempArray.reverse().map(d => {
    if (getForDate(d.date, dataset).doses) {
      currentItem = getForDate(d.date, dataset);
    }
    return {
      ...currentItem,
      date: new Date(d.date)
    } 
  });

  console.log(updatedDataset.reverse())
  

};

