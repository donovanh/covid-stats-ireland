const fsPromises = require('fs').promises;
const fetch = require('make-fetch-happen').defaults({
  cacheManager: './my-cache' // path where cache will be written (and read)
});

const processNationalData = (data) => {

  return data.features.map((feat, i) => {
    const d = feat.attributes;

    const prevDay = i > 0 ? data.features[i - 1].attributes : {};

    // Generate daily totals by subtracting previous day total
    const statsToTrack = [
      'HospitalisedCovidCases',
      'RequiringICUCovidCases',
      'HealthcareWorkersCovidCases',
      'HospitalisedAged5',
      'HospitalisedAged5to14',
      'HospitalisedAged15to24',
      'HospitalisedAged25to34',
      'HospitalisedAged35to44',
      'HospitalisedAged45to54',
      'HospitalisedAged55to64',
      'HospitalisedAged65up',
      'Male',
      'Female',
      'Unknown',
      'Aged1',
      'Aged1to4',
      'Aged5to14',
      'Aged15to24',
      'Aged25to34',
      'Aged35to44',
      'Aged45to54',
      'Aged55to64',
      'Aged65up'
    ]
    const generatedDailyTotals = {};
    statsToTrack.forEach(stat => {
      generatedDailyTotals[`daily${stat}`] = (d[stat] - prevDay[stat]) > 0 ? d[stat] - prevDay[stat] : 0;
    });

    return {
      date: new Date(d.Date),
      ...d,
      ...generatedDailyTotals
    }
  });
}

const getCountyData = async () => {
  const counties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
  const requests = [];
  for (const county of counties) {
    const url = `https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?where=CountyName%20%3D%20%27${county}%27&outFields=CountyName,PopulationCensus16,TimeStamp,ConfirmedCovidCases,PopulationProportionCovidCases,ConfirmedCovidDeaths,ConfirmedCovidRecovered&returnGeometry=false&outSR=4326&f=json`
    requests.push(fetch(url))
  }
  const responses = await Promise.all(requests);
  const processedResponses = responses.map(async (response) => await response.json());
  return await Promise.all(processedResponses);
}

const processCountyData = (countyResponses) => {

  const rows = [];
  const keys = {};

  for (const county of countyResponses) {
    for (const [i, feature] of county.features.entries()) {
      const d = feature.attributes;
      const prevData = i > 0 ? county.features[i - 1].attributes : {};

      const existingRow = rows.find(i => i.date === d.TimeStamp);
      let row = { date: d.TimeStamp };
      keys[d.CountyName] = true;

      const statsToTrack = [
        'ConfirmedCovidCases',
        'PopulationProportionCovidCases',
        'ConfirmedCovidDeaths',
        'ConfirmedCovidRecovered'
      ]
      const generatedDailyTotals = {};
      statsToTrack.forEach(stat => {
        generatedDailyTotals[`daily${stat}`] = (d[stat] - prevData[stat]) > 0 ? d[stat] - prevData[stat] : 0;
      });

      // Add in the needed data to row
      row[d.CountyName] = {
        ...d,
        ...generatedDailyTotals
      }
      if (existingRow) {
        // Assign the existing row data
        Object.assign(existingRow, row);
      } else {
        // Start new row
        rows.push(row)
      }
    }
  }

  for (const row of rows) {
    row.date = new Date(row.date);
  }

  rows.columns = Object.keys(keys);
  return rows;
};

const processHospitalData = (data) => {

  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.Date),
      hospitalisedCases: d.SUM_number_of_confirmed_covid_1,
      newAdmissions: d.SUM_no_new_admissions_covid19_p,
      newDischarges: d.SUM_no_discharges_covid19_posit
    }
  });
};

const processICUData = (data) => {

  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.Date),
      icuCases: d.ncovidconf
    }
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
      tests7Day: d.Test7
    }
  });
};

const getData = async () => {

  const nationalDataUrl = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidStatisticsProfileHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const hospitalDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19AcuteHospitalHistoricSummaryOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const icuDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/ICUBISHistoricTimelinePublicView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const testingDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/LaboratoryLocalTimeSeriesHistoricView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';

  const nationalResponse = await fetch(nationalDataUrl);
  const countyResponses = await getCountyData();
  const hospitalResponse = await fetch(hospitalDataUrl);
  const icuResponse = await fetch(icuDataUrl);
  const testingResponse = await fetch(testingDataUrl);

  const data = {
    national: processNationalData(await nationalResponse.json()),
    county: processCountyData(countyResponses),
    hospital: processHospitalData(await hospitalResponse.json()),
    icu: processICUData(await icuResponse.json()),
    testing: processTestingData(await testingResponse.json())
  }

  console.log(`Requesting new data records (${data.national.length} records)`);

  return data;
}

module.exports = async () => {

  // Development - work with cached local file
  if (process.env['NODE_ENV'] === 'development') {
    let data;
    try {
      const filecontent = await fsPromises.readFile('cached.json', 'utf-8');
      data = JSON.parse(filecontent);
      console.log('Read data file');
    } catch (err) {
      console.log('No data file found')
      data = await getData();
      // Write the file
      await fsPromises.writeFile('cached.json', JSON.stringify(data));
    }
    return data;
  } else {
    // Production - get the live data every time
    return getData();
  }
}

