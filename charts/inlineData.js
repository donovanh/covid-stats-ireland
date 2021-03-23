module.exports = (data) => {
  // Text summary of the important stats

  console.log('Generating inline data for hover')

  const {
    national,
    county,
    hospital,
    icu,
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
      value: Math.round(average)
    }
  });

  let prevVaccinationDataForDate = {};
  const allData = national.map(d => {
    const hospitalDataForDate = findByDate(d.date, hospitalData);
    const averageCasesForDate = findByDate(d.date, rolling7DayAvgCases);
    let vaccinationDataForDate = findByDate(d.date, vaccination) || {};
    if (!vaccinationDataForDate.doses) {
      vaccinationDataForDate = prevVaccinationDataForDate
    }
    prevVaccinationDataForDate = vaccinationDataForDate;
    return {
      date: new Date(d.date),
      c: d.ConfirmedCovidCases,
      h: hospitalDataForDate ? hospitalDataForDate.hospitalisedCases : null,
      i: hospitalDataForDate ? hospitalDataForDate.icuCases : null,
      d: d.ConfirmedCovidDeaths,
      v: vaccinationDataForDate.doses || 0,
      fv: vaccinationDataForDate.fullyVaccinated || 0,
      vAvg: vaccinationDataForDate.dailyAvgDoses || 0,
      cAvg: averageCasesForDate.value
    };
  });

  return {
    html: `<script>
     window.inlineData = ${JSON.stringify(allData)};
    </script>`,
    raw: allData
  }
};