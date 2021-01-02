// const fetch = require("node-fetch");

// module.exports = async function() {
//   console.log( "Fetching stats..." );

//   return fetch("http://localhost:3111")
//     .then(res => res.json()) // node-fetch option to transform to json
//     .then(stats => {
//       // prune the data to return only what we want
//       return {
//         dailyNationalCases: '<h2 class="test">ok so</h2>'
//       };
//     });
// };

const fetchData = require('../utils/fetch');

const dailyNationalCases = require('../charts/dailyNationalCases')

module.exports = async function() {

  const chartData = await fetchData();

  // Build each of the charts as SVG
  // With accompanying styles and interaction JS

  return {
    dailyNationalCases: dailyNationalCases(chartData)
  };
};