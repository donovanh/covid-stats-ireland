const D3Node = require('d3-node');
const { colours } = require('./theme');

module.exports = (data) => {

  console.log('Generating daily hospitalised cases area chart');

  const options = { selector: '#hospitalised', container: '<div id="container"><div id="hospitalised"></div></div>' }
  const d3n = new D3Node(options) // initializes D3 with container element
  const d3 = d3n.d3;

  // Set up dimensions and options
  const dataset = data.national.map(d => ({
    ...d,
    date: new Date(d.date)
  }));
  dataset.shift(); // Remove the first day as there's a gap after it
  
  const icuArrayLengthDiff = data.hospital.length - data.icu.length;
  
  const hospitalData = data.hospital.map((d, i) => ({
    ...d,
    date: new Date(d.date),
    icuCases: data.icu[i - icuArrayLengthDiff] ? data.icu[i - icuArrayLengthDiff].icuCases : 0
  }));

  const w = 800;
  const h = 300;
  const margin = ({ top: 10, right: 20, bottom: 30, left: 40 });

  // Set up scales
  const xScale = d3.scaleTime()
    .domain([
      d3.min(dataset, d => d.date),
      d3.max(hospitalData, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(hospitalData, d => d.hospitalisedCases)])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#hospitalised'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickPadding(5)
    .tickSize(5);

  const yAxis = d3.axisLeft(yScale)
    .ticks(4)
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));

  svg.append('clipPath')
    .attr('id', 'chart-area')
    .append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', w - margin.left - margin.right)
    .attr('height', h - margin.top - margin.bottom);

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

  svg.select('.y-axis')
    .select('.domain')
    .remove();

  svg.select('.y-axis')
    .select('.tick:first-of-type')
    .remove();

  // Y axis 
  svg.selectAll('.y-axis .tick line')
    .attr('stroke','#eee')
    .attr('stroke-dasharray','4')

  // X axis 
  svg.selectAll('.x-axis .tick line')
    .attr('stroke', colours.darkGrey)

  svg.selectAll('.tick text')
    .attr('fill', colours.darkGrey)

  // Define hospitalised as an area
  const hospitalised = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.hospitalisedCases))

  // Draw hospitalised area
  svg.append('path')
    .datum(hospitalData)
      .attr('class', 'hospitalised')
      .attr('fill', colours.light)
      .attr('d', hospitalised);

  // Define icu as an area
  const icu = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.icuCases))

  // Draw icu area
  svg.append('path')
    .datum(hospitalData)
      .attr('class', 'deaths')
      .attr('fill', colours.medium)
      .attr('d', icu);

  // Define deaths as an area
  const deaths = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.ConfirmedCovidDeaths))

  // Draw deaths area
  svg.append('path')
    .datum(dataset)
      .attr('class', 'deaths')
      .attr('fill', colours.veryDark)
      .attr('d', deaths);

  d3n.html()
  const html = `
    <h2>Hospitalised, ICU and deaths</h2>
    <div>
      ${d3n.chartHTML()}
    </div>
  `;

  return html;

}