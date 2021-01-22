module.exports = (data) => {
  // Text summary of the important stats

  console.log('Generating inline data for hover')

  const {
    national,
    county,
    hospital,
    icu,
    testing,
    vaccination
  } = data;

  // Prepare data to put inline
  const findByDate = (date, dataset) => dataset.find(d => {
    const dateObj = new Date(date);
    const compare1 = `${dateObj.getUTCFullYear()} ${dateObj.getUTCMonth()} ${dateObj.getUTCDate()}`;
    const dateObj2 = new Date(d.date);
    const compare2 = `${dateObj2.getUTCFullYear()} ${dateObj2.getUTCMonth()} ${dateObj2.getUTCDate()}`;
    return compare1 === compare2;
  });

  const icuArrayLengthDiff = data.hospital.length - data.icu.length;

  const hospitalData = data.hospital.map((d, i) => ({
    ...d,
    date: new Date(d.date),
    icuCases: icu[i - icuArrayLengthDiff] ? icu[i - icuArrayLengthDiff].icuCases : 0
  }));

  let prevVaccinationDataForDate = {};
  const allData = national.map(d => {
    const hospitalDataForDate = findByDate(d.date, hospitalData);
    const testingDataForDate = findByDate(d.date, testing) || {};
    let vaccinationDataForDate = findByDate(d.date, vaccination) || {};
    if (!vaccinationDataForDate.doses) {
      vaccinationDataForDate = prevVaccinationDataForDate
    }
    prevVaccinationDataForDate = vaccinationDataForDate;
    return {
      date: new Date(d.date),
      c: d.ConfirmedCovidCases,
      t: testingDataForDate.positiveRate7Day,
      h: hospitalDataForDate ? hospitalDataForDate.hospitalisedCases : null,
      i: hospitalDataForDate ? hospitalDataForDate.icuCases : null,
      d: d.ConfirmedCovidDeaths,
      v: vaccinationDataForDate.doses || 0,
      vAvg: vaccinationDataForDate.dailyAvgDoses || 0
    };
  });

  return `<script>
     window.inlineData = ${JSON.stringify(allData)};
    </script>`;
};