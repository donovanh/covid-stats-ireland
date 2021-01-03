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
  
  casesByAgeArray = [
    { age: 'Zero', value: 0 },
    ...casesByAgeArray
  ];

  casesByHospitalisedArray = [
    { age: 'Zero', value: 0 },
    ...casesByHospitalisedArray
  ];

  const w = 800;
  const h = 300;
  const margin = ({ top: 20, right: 30, bottom: 30, left: 40 });

  // Set up scales
  const xScale = d3.scaleBand()
    .domain(casesByAgeArray.map(d => d.age))
    .range([margin.left, w - margin.right]);

  // Scale for cases by age
  const yScale0 = d3.scaleLinear()
    .domain([0, d3.max(casesByAgeArray, d => d.value)])
    .range([(h * 0.8) - margin.bottom, margin.top]);

  // Scale for hospitalised by age
  const yScale1 = d3.scaleLinear()
    .domain([0, d3.max(casesByAgeArray, d => d.value)])
    .range([(h * 0.8) - margin.bottom, (h * 1.2) - margin.bottom]);

  // // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#byage'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickSize(0);

  // Axis for cases by age
  const maxCaseValue = d3.max(casesByAgeArray, d => d.value);
  const yAxis0 = d3.axisLeft(yScale0)
    .tickValues([0, maxCaseValue])
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));
    //.tickSize(0);

  // Axis for hospitalised age
  const maxHospitalisedValue = d3.max(casesByHospitalisedArray, d => d.value);
  const yAxis1 = d3.axisLeft(yScale1)
    .tickValues([0, maxHospitalisedValue])
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));
    //.tickSize(0);

  // const getTicksDistance = (scale) => {
  //   const ticks = scale.ticks();
  //   const spaces = []
  //   for(let i=0; i < ticks.length - 1; i++){
  //     spaces.push(scale(ticks[i+1]) - scale(ticks[i]))
  //   }
  //   return spaces;
  // };

  // const xTickDistance = getTicksDistance(xScale)[0];

  // svg.append('clipPath')
  //   .attr('id', 'chart-area')
  //   .append('rect')
  //   .attr('x', margin.left)
  //   .attr('y', margin.top)
  //   .attr('width', w - margin.left - margin.right)
  //   .attr('height', h - margin.top - margin.bottom);

  // x axis
  svg.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${h - margin.bottom})`)
    .call(xAxis);

  // svg.select('.x-axis')
  //   .selectAll('text')
  //   .attr('transform', `translate(-${xScale.bandwidth() * 0.5}, 0)`)

  svg.select('.x-axis')
    .select('.domain')
    .remove();

  svg.select('.x-axis')
    .selectAll('.tick:first-of-type text')
    .remove()

  // svg.select('.x-axis')
  //   .selectAll('.tick:last-of-type text')
  //   .remove();

  // y axis
  svg.append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis0);

  svg.append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis1);

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
    .y0(() => yScale0.range()[0])
    .y1(d => yScale0(d.value));

  // Draw cases by age area
  svg.append('path')
    .datum(casesByAgeArray)
    .attr('class', 'cases-by-age')
    .attr('fill', '#ddd')
    .attr('d', casesByAgeArea);

  // Define hospitalised by age as area
  const hospitalisedByAgeArea = d3.area()
    //.curve(d3.curveBasis)
    .x(d => xScale(d.age) + xScale.bandwidth() / 2)
    .y0(() => yScale1.range()[0])
    .y1(d => yScale1(d.value));

  // Draw cases by age area
  svg.append('path')
    .datum(casesByHospitalisedArray)
    .attr('class', 'cases-by-age')
    .attr('fill', '#999')
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