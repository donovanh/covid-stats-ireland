const D3Node = require('d3-node');
const { colours } = require('./theme');

module.exports = ({ county: dataset }) => {

  console.log('Generating county list');

  const options = { selector: '#county-list', container: '<div id="container"><div id="county-list"></div></div>' }
  const d3n = new D3Node(options) // initializes D3 with container element
  const d3 = d3n.d3;

  dataset.sort((a, b) => d3.descending(a.ConfirmedCovidCases, b.ConfirmedCovidCases));

  const w = 600;
  const h = 700;
  const margin = ({ top: 30, right: 30, bottom: 30, left: 70 });

  const svg = d3.select(d3n.document.querySelector('#county-list'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  const max = Math.ceil(d3.max(dataset, d => d.PopulationProportionCovidCases / 1000));

  // Set up scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.ConfirmedCovidCases)])
    .rangeRound([margin.left, w - margin.right])
    .nice();

  const yScale = d3.scaleBand()
    .domain(dataset.map(d => `${d.CountyName}`))
    .rangeRound([margin.top, h - margin.bottom])
    .paddingInner(0.25);
  
  const yScaleZeroPad = d3.scaleBand()
    .domain(dataset.map(d => `${d.CountyName}`))
    .rangeRound([margin.top, h - margin.bottom])
    .paddingInner(0);

  const colScale = d3.scaleLinear()
    .domain([0, max])
    .rangeRound([0, colours.reds.length - 1]);

  // Set up axes
  const xAxis = d3.axisTop(xScale)
    .ticks(4)
    .tickPadding(5)
    .tickSize(0 - (h - margin.bottom - margin.top));

  const yAxis = d3.axisLeft(yScale)
    .tickSize(0)
    .tickPadding(10);

  // Draw axes
  svg.select('.svg-bars-container')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  // Add a masked area
  svg.append('clipPath')
    .attr('id', 'chart-area')
    .append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', w - margin.left - margin.right)
    .attr('height', h - margin.top - margin.bottom);

  // Create X axis
  svg.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${margin.top})`)
    .call(xAxis);

  svg.selectAll('.x-axis .tick line')
    .attr('stroke','#eee')
    .attr('stroke-dasharray','4')

  // Create Y axis
  svg.append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

  svg.selectAll('.domain')
    .remove();

  svg.select('.x-axis')
    .select('.tick:first-of-type')
    .remove();

  // Draw bars
  const barGroups = svg.selectAll('.bargroup')
    .data(dataset, d => d.CountyName)
    .enter()
    .append('g')
    .attr('class', 'bargroup');

  barGroups
    .append('rect')
    .attr('x', margin.left)
    .attr('y', (d) => yScale(d.CountyName))
    .attr('width', (d) => w - margin.right)
    .attr('height', yScale.bandwidth())
    .attr('fill', 'transparent');

  barGroups
    .append('rect')
    .attr('class', 'bar')
    .attr('x', margin.left)
    .attr('y', (d) => yScale(d.CountyName))
    .attr('width', (d) => xScale(d.ConfirmedCovidCases) - margin.right)
    .attr('height', yScale.bandwidth())
    .attr('fill', (d) => colours.reds[colScale(d.PopulationProportionCovidCases / 1000)]);

  d3n.html();
  const html = `
    <h2>Total cases by county</h2>
    <div class="list-wrapper" style="max-width: ${w}px">
      ${d3n.chartHTML()}
    </div>
  `;
  
  return html;

};