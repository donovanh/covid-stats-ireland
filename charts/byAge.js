const D3Node = require('d3-node');

module.exports = (data) => {

  console.log('Generating cases and hospitalisations by age');

  const options = { selector: '#byage', container: '<div id="container"><div id="byage"></div></div>' }
  const d3n = new D3Node(options) // initializes D3 with container element
  const d3 = d3n.d3;

  // Set up dimensions and options
  const sourceData = data.national[data.national.length - 1];

  const getProps = (source, props) => {
    const res = {};
    for (const prop of props) {
      res[prop] = source[prop];
    }
    return res;
  }

  const agedProps = [
    'Aged1',
    'Aged5to14',
    'Aged15to24',
    'Aged25to34',
    'Aged35to44',
    'Aged45to54',
    'Aged55to64',
    'Aged65up'
  ];

  const hospitalProps = [
    'HospitalisedAged5',
    'HospitalisedAged5to14',
    'HospitalisedAged15to24',
    'HospitalisedAged25to34',
    'HospitalisedAged35to44',
    'HospitalisedAged45to54',
    'HospitalisedAged55to64',
    'HospitalisedAged65up'
  ]

  const caseTotals = getProps(sourceData, agedProps);
  const hospitalTotals = getProps(sourceData, hospitalProps);

  let casesByAgeArray = Object.entries(caseTotals).map((entry) => ({
    age: entry[0]
      .replace('to', ' to ')
      .replace('Aged1', 'Under 5')
      .replace('Aged', '')
      .replace('1 to 55 to 24', '15 to 24')
      .replace('65up', '65 up')
      .replace('Under 55 to 24', '15 to 24'),
    value: entry[1]
  }));

  let casesByHospitalisedArray = Object.entries(hospitalTotals).map((entry) => ({
    age: entry[0]
      .replace('HospitalisedAged5', 'Under 5')
      .replace('Under 5to14', '5to14')
      .replace('Under 55to64', '55to64')
      .replace('HospitalisedAged', '')
      .replace('to', ' to ')
      .replace('up', ' up'),
    value: entry[1]
  }));

  const w = 800;
  const h = 300;
  const margin = ({ top: 20, right: 30, bottom: 40, left: 40 });

  // Set up scales
  const xScale = d3.scaleBand()
    .domain(casesByAgeArray.map(d => d.age))
    .range([margin.left, w - margin.right]);

  // Scale for cases by age
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(casesByAgeArray, d => d.value)])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#byage'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickPadding(10)
    .tickSize(0);

  // Axis for cases by age
  const maxCaseValue = d3.max(casesByAgeArray, d => d.value);
  const maxHospitalisedValue = d3.max(casesByHospitalisedArray, d => d.value);

  const yAxis = d3.axisLeft(yScale)
    .tickValues([0, maxHospitalisedValue, maxCaseValue])
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));

  // x axis
  svg.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${h - margin.bottom})`)
    .call(xAxis);

  svg.select('.x-axis')
    .select('.domain')
    .remove();

  // y axis
  svg.append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

  svg.selectAll('.y-axis')
    .select('.domain')
    .remove();

  svg.selectAll('.y-axis')
    .selectAll('.tick:first-of-type')
    .remove();

  // // Both axes 
  svg.selectAll('.tick line')
    .attr('stroke','#eee')
    .attr('stroke-dasharray','4')

  svg.selectAll('.tick text')
    .attr('fill', '#666')

  // Define cases by age as area
  const casesByAgeArea = d3.area()
    //.curve(d3.curveBasis)
    .x(d => (xScale(d.age) + xScale.bandwidth() / 2))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.value));

  // Draw cases by age area
  svg.append('path')
    .datum(casesByAgeArray)
    .attr('class', 'cases-by-age')
    .attr('fill', 'rgba(0,0,0,0.25)')
    .attr('d', casesByAgeArea);

  // Define hospitalised by age as area
  const hospitalisedByAgeArea = d3.area()
    //.curve(d3.curveBasis)
    .x(d => xScale(d.age) + xScale.bandwidth() / 2)
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.value));

  // Draw cases by hospitalised area
  svg.append('path')
    .datum(casesByHospitalisedArray)
    .attr('class', 'cases-by-age')
    .attr('fill', 'rgba(0,0,0,0.5)')
    .attr('d', hospitalisedByAgeArea);

  d3n.html()
  const html = `
    <h2>Cases by age group</h2>
    <h3>Total confirmed cases and total hospitalised cases grouped by age</h3>
    <div style="max-width: ${w}px">
      ${d3n.chartHTML()}
    </div>
  `;
  return html;

}