const fetchData = require('../utils/fetch');
const summary = require('../charts/summary');
const dailyNationalCases = require('../charts/dailyNationalCases');
const dailyHospitalised = require('../charts/dailyHospitalised');
const byAge = require('../charts/byAge');
//const countyMap = require('../charts/countyMap');

module.exports = async function() {

  const data = await fetchData();

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  const lastUpdated = {
    national: new Date(data.national[data.national.length - 1].date).toLocaleDateString("en-US", dateOptions),
    county: new Date(data.county[data.county.length - 1].date).toLocaleDateString("en-US", dateOptions)
  };

  return {
    summary: summary(data),
    dailyNationalCases: dailyNationalCases(data),
    dailyHospitalised: dailyHospitalised(data),
    byAge: byAge(data),
    //countyMap: countyMap(data),
    lastUpdated,
    lastRun: new Date()
  };
};