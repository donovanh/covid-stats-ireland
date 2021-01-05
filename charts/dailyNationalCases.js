const D3Node = require('d3-node');
const { colours } = require('./theme');

module.exports = (data) => {

  console.log('Generating national chart');

  const options = { selector: '#cases', container: '<div id="container"><div id="cases"></div></div>' }
  const d3n = new D3Node(options) // initializes D3 with container element
  const d3 = d3n.d3

  // Set up dimensions and options
  const dataset = data.national.map(d => ({
    ...d,
    date: new Date(d.date)
  }));
  const w = 800;
  const h = 300;
  const margin = ({ top: 20, right: 30, bottom: 30, left: 40 });

  // Generate rolling 7-day average cases from today back
  const sevenDayAverages = dataset.map((d, i) => {
    // For each day take the preceeding 6 days and produce average
    const vals = [];
    for (let j = -7; j < 7; j++) {
      if (dataset[i - j]) {
        vals.push(dataset[i - j].ConfirmedCovidCases);
      }
    }
    const average = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      date: new Date(d.date),
      value: average
    }
  });

  // Set up scales
  const xScale = d3.scaleTime()
    .domain([
      d3.min(dataset, d => d.date),
      d3.max(dataset, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  const xBarScale = d3.scaleBand()
    .domain(dataset.map(d => `${d.date}`))
    .range([margin.left, w - margin.right])
    .paddingInner(0.05);

  const sevenDayAvgXScale = d3.scaleTime()
    .domain([
      d3.min(sevenDayAverages, d => d.date),
      d3.max(sevenDayAverages, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  // Scale Y to the weekly average line
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(sevenDayAverages, d => d.value) * 1.2])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#cases'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickPadding(10)
    .tickSize(0);

  const yAxis = d3.axisLeft(yScale)
    .ticks(3)
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));

  const getTicksDistance = (scale) => {
    const ticks = scale.ticks();
    const spaces = []
    for(let i=0; i < ticks.length - 1; i++){
      spaces.push(scale(ticks[i+1]) - scale(ticks[i]))
    }
    return spaces;
  };

  const xTickDistance = getTicksDistance(xScale)[0];

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
    .selectAll('text')
    .attr('transform', `translate(${xTickDistance / 2}, 0)`)

  svg.select('.x-axis')
    .select('.domain')
    .remove();

  svg.select('.x-axis')
    .selectAll('.tick:last-of-type text')
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

  // Both axes 
  svg.selectAll('.tick line')
    .attr('stroke', colours.lightGrey)
    .attr('stroke-dasharray','4')

  svg.selectAll('.tick text')
    .attr('fill', colours.darkGrey)

    // Draw daily stat bars
  svg
    .append('g')
    .attr('id', 'bars')
    .selectAll('.bar')
    .data(dataset, (d) => d.date)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('data-key', (d) => d.date)
    .attr('x', (d) => xBarScale(d.date))
    .attr('y', (d) => yScale(d.ConfirmedCovidCases))
    .attr('width', xBarScale.bandwidth() / 2)
    .attr('height', (d) => h - yScale(d.ConfirmedCovidCases) - margin.bottom)
    .attr('fill', colours.light);

  // Define weekly average line
  const sevendayAvgLine = d3.line()
    .curve(d3.curveBasis)
    .x(d => sevenDayAvgXScale(d.date))
    .y(d => yScale(d.value));
  
  svg.append('path')
    .datum(sevenDayAverages)
    .attr('class', 'seven-day-avg')
    .attr('fill', 'none')
    .attr('stroke-dasharray', 2)
    .attr('stroke-width', 2)
    .attr('stroke', colours.darkGrey)
    .attr('d', sevendayAvgLine);

  // Add a fade-out for the top larger values
  const gradient = svg.append('linearGradient')
    .attr('id', 'fadeGradient')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 1);

  gradient.append('stop')
    .attr('offset', '0')
    .attr('stop-color', 'rgba(255,255,255,1)');

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(255,255,255,0)');

  svg.append('rect')
    .classed('fade-out', true)
    .attr('x', margin.left)
    .attr('y', 0)
    .attr('height', 40)
    .attr('width', w - margin.right - margin.left)
    .attr('fill', 'url(#fadeGradient)')

  d3n.html()
  const html = `
    <h2>Confirmed cases</h2>
    <h3>Daily confirmed cases and 14-day average</h3>
    <div style="max-width: ${w}px">
      ${d3n.chartHTML()}
    </div>
  `;

  return html;

}