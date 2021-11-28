const fetchData = require("../utils/fetch");
const summary = require("../charts/summary");
const dailyNationalCases = require("../charts/dailyNationalCases");
const dailyHospitalised = require("../charts/dailyHospitalised");
const dailyVaccinated = require("../charts/dailyVaccinated");
const projectedVaccinated = require("../charts/projectedVaccinated");
const byAge = require("../charts/byAge");
const countyMap = require("../charts/countyMap");
const countyList = require("../charts/countyList");
const inlineData = require("../charts/inlineData");

module.exports = async function () {
  const data = await fetchData();

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  const screenshotFilename = `covid-stats-ireland.png?${today.getTime()}`;
  const lastUpdated = {
    national: new Date(
      data.national[data.national.length - 1].date
    ).toLocaleDateString("en-US", dateOptions),
    county: new Date(
      data.county[data.county.length - 1].date
    ).toLocaleDateString("en-US", dateOptions),
  };

  // Calculate the estimated vaccination date
  const pop = 4055500; // ADULTS estimated
  const estimatedGoalPop = Math.floor(pop * 0.95); // 95% of population

  // Current rate per day, calculate based on 7 day average
  let sevenDayTotalDoses = 0;
  for (let i = 1; i < 8; i++) {
    sevenDayTotalDoses +=
      data.vaccination[data.vaccination.length - i].dailyFullyVaccinated;
  }
  const dosesPerDay = Math.floor(sevenDayTotalDoses / 7);

  const totalVaccinated =
    data.vaccination[data.vaccination.length - 1].fullyVaccinated;
  const peopleYetToVaccinate = estimatedGoalPop - totalVaccinated;
  const numberofDaysTo95 = peopleYetToVaccinate / (dosesPerDay / 2);
  const estDuration95MS = numberofDaysTo95 * 24 * 60 * 60 * 1000;
  const estimated95Date = new Date().getTime() + estDuration95MS;

  /*
    const pop = 3700000; // ADULTS estimated
  const estimatedGoalPop = Math.floor(pop * 0.95);// 95% of population

  // Current rate per day
  let sevenDayTotalDoses = 0;
  for (let i = 1; i < 8; i++) {
    sevenDayTotalDoses += data.vaccination[data.vaccination.length - i].dailyAvgDoses;
  }
  const dosesPerDay = Math.floor(sevenDayTotalDoses / 7);

  const totalVaccinated = data.vaccination[data.vaccination.length - 1].fullyVaccinated;
  const peopleYetToVaccinate = estimatedGoalPop - totalVaccinated;
  const numberofDaysTo95 = peopleYetToVaccinate / (dosesPerDay / 2);
  const estDuration95MS = numberofDaysTo95 * 24 * 60 * 60 * 1000;
  const estimated95Date = new Date().getTime() + estDuration95MS;

  */

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
    estDuration: Math.round(numberofDaysTo95),
    estDailyRate: dosesPerDay,
  };
};
