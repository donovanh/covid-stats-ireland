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

  // Calculate the estimated vaccination date
  const pop = data.irelandPop || 4970499;
  const estimatedGoalPop = Math.floor(pop * 0.95);// 95% of population

  // Current rate per day
  const ratePerDay = data.vaccination[data.vaccination.length - 1].dailyAvgDoses;
  const totalDosesNeeded = estimatedGoalPop * 2;
  const dosesNeeded = totalDosesNeeded - data.vaccination[data.vaccination.length - 1].doses;
  const estDuration = dosesNeeded / ratePerDay;
  const estDurationMS = estDuration * 24 * 60 * 60 * 1000;
  const estimated95Date = new Date().getTime() + estDurationMS;

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
    screenshotFilename,
    data,
    estimated95Date,
    estDuration: Math.round(estDuration)
  };
};