module.exports = (data) => {
  // Text summary of the important stats

  console.log('Generating summary')

  const national = [...data.national];
  // const county = [...data.county];
  const hospital = [...data.hospital];
  const icu = [...data.icu];
  const vaccination = [...data.vaccination];

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

  const format = (number) => Intl.NumberFormat('en-UK').format(number);

  return {
    ConfirmedCovidCases: format(national[national.length - 1].ConfirmedCovidCases),
    ConfirmedCovidDeaths: format(national[national.length - 1].ConfirmedCovidDeaths),
    previousConfirmedCovidCases: format(national[national.length - 2].ConfirmedCovidCases),
    avgCases: format(rolling7DayAvgCases[rolling7DayAvgCases.length - 1].value),
    previousAvgCases: format(rolling7DayAvgCases[rolling7DayAvgCases.length - 8].value),
    hospitalised: format(hospital[hospital.length - 1].hospitalisedCases),
    latestICU: format(icu[icu.length - 1].icuCases),
    vaccinations: format(vaccination[vaccination.length - 1].doses)
  };
};