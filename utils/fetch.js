const fsPromises = require("fs").promises;
const puppeteer = require("puppeteer");
const CSV = require("csv-string");
const fetch = require("make-fetch-happen").defaults({
  cacheManager: "./my-cache", // path where cache will be written (and read)
});

const processNationalData = (data) => {
  let confirmedDeaths;

  return data.features.map((feat, i) => {
    const d = feat.attributes;

    //const prevDay = i > 0 ? data.features[i - 1].attributes : {};

    // Generate daily totals by subtracting previous day total
    // const statsToTrack = [
    //   'HospitalisedCovidCases',
    //   'RequiringICUCovidCases',
    //   'HealthcareWorkersCovidCases',
    //   'HospitalisedAged5',
    //   'HospitalisedAged5to14',
    //   'HospitalisedAged15to24',
    //   'HospitalisedAged25to34',
    //   'HospitalisedAged35to44',
    //   'HospitalisedAged45to54',
    //   'HospitalisedAged55to64',
    //   'HospitalisedAged65up',
    //   'Male',
    //   'Female',
    //   'Unknown',
    //   'Aged1',
    //   'Aged1to4',
    //   'Aged5to14',
    //   'Aged15to24',
    //   'Aged25to34',
    //   'Aged35to44',
    //   'Aged45to54',
    //   'Aged55to64',
    //   'Aged65up'
    // ]
    // const generatedDailyTotals = {};
    // statsToTrack.forEach(stat => {
    //   generatedDailyTotals[`daily${stat}`] = (d[stat] - prevDay[stat]) > 0 ? d[stat] - prevDay[stat] : 0;
    // });

    // Tidy daily confirmed death numbers
    if (new Date(d.Date) > new Date("2021-05-01")) {
      if (d.ConfirmedCovidDeaths) {
        confirmedDeaths = Math.round(d.ConfirmedCovidDeaths / 7);
      }
    } else {
      confirmedDeaths = d.ConfirmedCovidDeaths;
    }

    return {
      date: new Date(d.Date),
      ...d,
      ConfirmedCovidDeaths: confirmedDeaths,
      //...generatedDailyTotals
    };
  });
};

const getCountyData = async () => {
  // const counties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
  // const requests = [];
  // for (const county of counties) {
  //   const url = `https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?where=CountyName%20%3D%20%27${county}%27&outFields=CountyName,PopulationCensus16,TimeStamp,ConfirmedCovidCases,PopulationProportionCovidCases,ConfirmedCovidDeaths,ConfirmedCovidRecovered&returnGeometry=false&outSR=4326&f=json`
  //   requests.push(fetch(url))
  // }
  // const responses = await Promise.all(requests);
  // const processedResponses = responses.map(async (response) => await response.json());
  // return await Promise.all(processedResponses);
};

const processCountyData = (data) => {
  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.TimeStampDate),
      ...d,
    };
  });
};

const processHospitalData = (data) => {
  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.Date),
      hospitalisedCases: d.SUM_number_of_confirmed_covid_1,
      newAdmissions: d.SUM_no_new_admissions_covid19_p,
      newDischarges: d.SUM_no_discharges_covid19_posit,
    };
  });
};

const processICUData = (data) => {
  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.Date),
      icuCases: d.ncovidconf,
    };
  });
};

const processTestingData = (data) => {
  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.Date_HPSC),
      positiveRate: d.PRate,
      positiveRate7Day: d.PosR7,
      tests: d.Test24,
      tests7Day: d.Test7,
    };
  });
};

const getForDate = (date, dataset) => {
  const result = dataset.find((d) => {
    const date1 = new Date(d.date);
    const compare1 = `${date1.getUTCFullYear()} ${date1.getUTCMonth()} ${date1.getUTCDate()}`;
    const date2 = new Date(date);
    const compare2 = `${date2.getUTCFullYear()} ${date2.getUTCMonth()} ${date2.getUTCDate()}`;
    return compare1 === compare2;
  });
  return result || {};
};

const processVaccinationData = (data) => {
  const parsedData = CSV.parse(data);
  const result = [];
  let fullyVaccinatedSoFar = 0;
  for ([index, row] of parsedData.entries()) {
    if (index === 0) {
      continue;
    }
    /*
    0 location,
    1 date
    2 vaccine
    3 source_url
    4 total_vaccinations
    5 people_vaccinated
    6 people_fully_vaccinated
    7 total_boosters
    */
    if (+row[5]) {
      fullyVaccinatedSoFar = +row[6];
    }
    if (row.length > 1) {
      result.push({
        date: new Date(row[1]),
        vaccineType: row[2],
        doses: +row[4],
        people: +row[5],
        fullyVaccinated: fullyVaccinatedSoFar,
        boosters: +row[7],
      });
    }
  }

  // Vaccines began 29th Dec
  const firstDataPoint = {
    date: new Date("2020-12-29T00:00:00.000Z"),
    doses: 0,
    people: 0,
    fullyVaccinated: 0,
  };
  result.unshift(firstDataPoint);

  let dataset = result.map((d, i) => {
    const prevDay = result[i - 1]
      ? result[i - 1]
      : {
          doses: 0,
          people: 0,
          fullyVaccinated: 0,
        };
    const averages = {};
    let daysBetween =
      (new Date(d.date) - new Date(prevDay.date)) / (1000 * 3600 * 24) || 1;
    averages.dailyAvgDoses = Math.round(
      (d.doses - prevDay.doses) / daysBetween
    );
    averages.dailyFullyVaccinated = Math.round(
      (d.fullyVaccinated - prevDay.fullyVaccinated) / daysBetween
    );

    return {
      ...d,
      ...averages,
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
  while (currentDate <= lastDate) {
    if (getForDate(currentDate, dataset) !== {}) {
      tempArray.push({
        date: currentDate,
      });
    }

    currentDate += oneDay;
  }

  let currentItem = dataset[dataset.length - 1];

  const filledDates = tempArray
    .reverse()
    .map((d) => {
      if (getForDate(d.date, dataset).doses) {
        currentItem = getForDate(d.date, dataset);
      }
      return {
        dailyAvgDoses: currentItem.dailyAvgDoses,
        dailyFullyVaccinated: currentItem.dailyFullyVaccinated,
        date: d.date,
      };
    })
    .reverse();

  // Go through filled dates and add estimated
  // fully vaccinated between each
  const datesWithEstimate = [];
  filledDates.forEach((d, i) => {
    let estimatedFullyVaccinated = 0;
    let estimatedDoses = 0;
    if (i > 0) {
      const prevDay = datesWithEstimate[i - 1];
      estimatedFullyVaccinated =
        prevDay.estimatedFullyVaccinated + prevDay.dailyFullyVaccinated;
      estimatedDoses = prevDay.estimatedDoses + prevDay.dailyAvgDoses;
    }
    datesWithEstimate.push({
      ...d,
      estimatedFullyVaccinated,
      estimatedDoses,
    });
  });

  // Go through the filled dates and add in the current
  // reported values per day
  currentItem = dataset[0];
  return datesWithEstimate.map((d) => {
    if (getForDate(d.date, dataset).doses) {
      currentItem = getForDate(d.date, dataset);
    }
    return {
      ...d,
      ...currentItem,
      date: new Date(d.date),
    };
  });
};

// const getNIData = async () => {
//   const browser = await puppeteer.launch({
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();
//   await page.goto("https://nicovidtracker.org", { waitUntil: "networkidle2" });
//   await page.waitForSelector("#nipositiveBox2 h3");
//   const totalCases = await page.evaluate(
//     (el) => el.innerHTML,
//     await page.$("#nipositiveBox1 h3")
//   );
//   const per100k = await page.evaluate(
//     (el) => el.innerHTML,
//     await page.$("#nipositiveBox2 h3")
//   );
//   await browser.close();
//   return {
//     totalCases,
//     per100k,
//   };
// };

const getIrelandPop = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.worldometers.info/world-population/ireland-population/",
    { waitUntil: "networkidle2" }
  );
  await page.waitForSelector(".maincounter-number");
  const res = await page.evaluate(
    (el) => el.innerHTML,
    await page.$(".maincounter-number")
  );
  const irelandPop = res
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/,/g, "")
    .trim();
  await browser.close();
  return parseInt(irelandPop);
};

const getData = async () => {
  const nationalDataUrl =
    "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidStatisticsProfileHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json";
  const hospitalDataUrl =
    "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19AcuteHospitalHistoricSummaryOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json";
  const icuDataUrl =
    "https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/ICUBISHistoricTimelinePublicView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json";
  //const testingDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/LaboratoryLocalTimeSeriesHistoricView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const countyDataUrl =
    "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=CountyName,PopulationCensus16,IGEasting,IGNorthing,ConfirmedCovidCases,PopulationProportionCovidCases,ConfirmedCovidDeaths,ConfirmedCovidRecovered,x,y,FID,TimeStampDate&returnGeometry=false&outSR=4326&f=json";
  const vaccinationCSV =
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Ireland.csv";

  const nationalResponse = await fetch(nationalDataUrl);
  const countyResponses = await fetch(countyDataUrl);
  const hospitalResponse = await fetch(hospitalDataUrl);
  const icuResponse = await fetch(icuDataUrl);
  //const testingResponse = await fetch(testingDataUrl);
  const vaccinationResponse = await fetch(vaccinationCSV);
  //const northernIreland = await getNIData();
  const irelandPop = await getIrelandPop();

  const data = {
    national: processNationalData(await nationalResponse.json()),
    county: {}, // processCountyData(await countyResponses.json()),
    hospital: processHospitalData(await hospitalResponse.json()),
    icu: processICUData(await icuResponse.json()),
    //testing: processTestingData(await testingResponse.json()),
    vaccination: processVaccinationData(await vaccinationResponse.text()),
    northernIreland: {},
    irelandPop,
  };

  console.log(`Requesting new data records (${data.national.length} records)`);

  return data;
};

module.exports = async () => {
  // Development - work with cached local file
  if (process.env["NODE_ENV"] === "development") {
    let data;
    try {
      const filecontent = await fsPromises.readFile("cached.json", "utf-8");
      data = JSON.parse(filecontent);
      console.log("Read data file");
    } catch (err) {
      console.log("No data file found");
      data = await getData();
      // Write the file
      await fsPromises.writeFile("cached.json", JSON.stringify(data));
    }
    return data;
  } else {
    // Production - get the live data every time
    return getData();
  }
};
