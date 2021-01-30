const fetchData = require('../utils/fetch');
const summary = require('../charts/summary');
const dailyNationalCases = require('../charts/dailyNationalCases');
const dailyHospitalised = require('../charts/dailyHospitalised');
const dailyVaccinated = require('../charts/dailyVaccinated');
const projectedVaccinated = require('../charts/projectedVaccinated');
const byAge = require('../charts/byAge');
const countyMap = require('../charts/countyMap');
const countyList = require('../charts/countyList');
const inlineData = require('../charts/inlineData');

module.exports = async function() {

  const data = await fetchData();

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  const screenshotFilename = `covid-stats-ireland.png?${today.getTime()}`;
  const lastUpdated = {
    national: new Date(data.national[data.national.length - 1].date).toLocaleDateString("en-US", dateOptions),
    county: new Date(data.county[data.county.length - 1].date).toLocaleDateString("en-US", dateOptions)
  };

  return {
    summary: summary(data),
    dailyNationalCases: dailyNationalCases(data),
    dailyHospitalised: dailyHospitalised(data),
    dailyVaccinated: dailyVaccinated(data),
    projectedVaccinated: projectedVaccinated(data),
    byAge: byAge(data),
    countyMap: countyMap(data),
    countyList: countyList(data),
    inlineData: inlineData(data),
    lastUpdated,
    lastRun: new Date(),
    screenshotFilename
  };
};