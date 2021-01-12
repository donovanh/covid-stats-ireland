const fsPromises = require('fs').promises;
const fetch = require('make-fetch-happen').defaults({
  cacheManager: './my-cache' // path where cache will be written (and read)
});

const processNationalData = (data) => {

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

    return {
      date: new Date(d.Date),
      ...d,
      //...generatedDailyTotals
    }
  });
}

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
}

const processCountyData = (data) => {

  return data.features.map((feat, i) => {
    const d = feat.attributes;
    return {
      date: new Date(d.TimeStampDate),
      CountyName: d.CountyName,
      PopulationCensus16: d.PopulationCensus16,
      ConfirmedCovidCases: d.ConfirmedCovidCases,
      PopulationProportionCovidCases: d.PopulationProportionCovidCases,
      ConfirmedCovidDeaths: d.ConfirmedCovidDeaths,
      ConfirmedCovidRecovered: d.ConfirmedCovidRecovered

    }
  });
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

const processVaccinationData = (data) => {
  console.log(data)
  const result = [];
  const rows = data.split('\n');
  for ([index, row] of rows.entries()) {
    if (index === 0) {
      continue;
    }
    const rowData = row.split(",");
    if (rowData.length > 1) {
      result.push({
        date: new Date(rowData[1]),
        vaccineType: rowData[2],
        doses: +(rowData[4]),
        people: +(rowData[5]),
        fullyVaccinated: +(rowData[6])
      });
    }
  }
  return result;
};

const getData = async () => {

  const nationalDataUrl = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/CovidStatisticsProfileHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const hospitalDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19AcuteHospitalHistoricSummaryOpenData/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const icuDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/ICUBISHistoricTimelinePublicView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const testingDataUrl = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/LaboratoryLocalTimeSeriesHistoricView/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&outSR=4326&f=json';
  const countyDataUrl = 'https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=1%3D1&outFields=CountyName,PopulationCensus16,IGEasting,IGNorthing,ConfirmedCovidCases,PopulationProportionCovidCases,ConfirmedCovidDeaths,ConfirmedCovidRecovered,x,y,FID,TimeStampDate&returnGeometry=false&outSR=4326&f=json';
  const vaccinationCSV = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Ireland.csv';

  const nationalResponse = await fetch(nationalDataUrl);
  const countyResponses = await fetch(countyDataUrl);
  const hospitalResponse = await fetch(hospitalDataUrl);
  const icuResponse = await fetch(icuDataUrl);
  const testingResponse = await fetch(testingDataUrl);
  const vaccinationResponse = await fetch(vaccinationCSV);

  const data = {
    national: processNationalData(await nationalResponse.json()),
    county: processCountyData(await countyResponses.json()),
    hospital: processHospitalData(await hospitalResponse.json()),
    icu: processICUData(await icuResponse.json()),
    testing: processTestingData(await testingResponse.json()),
    vaccination: processVaccinationData(await vaccinationResponse.text())
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

