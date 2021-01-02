const D3Node = require('d3-node');

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
  const h = 400;
  const margin = ({top: 20, right: 30, bottom: 30, left: 40});

  // Set up scales
  const xScale = d3.scaleTime()
    .domain([
      d3.min(dataset, d => d.date),
      d3.max(dataset, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.ConfirmedCovidCases)])
    .range([h - margin.bottom - 10, margin.top]);

  // Define line
  const cases = d3.line()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y(d => yScale(d.ConfirmedCovidCases));

  // Define hospitalised as an area
  const hospitalised = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.dailyHospitalisedCovidCases))

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#cases'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickSize(0);

  const yAxis = d3.axisLeft(yScale)
    .ticks(4)
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
    .selectAll('.tick:first-of-type text')
    .remove();

  // Both axes 
  svg.selectAll('.tick line')
    .attr('stroke','#eee')
    .attr('stroke-dasharray','4')

  svg.selectAll('.tick text')
    .attr('fill', '#666')

  // Draw total cases line
  svg.append('path')
    .datum(dataset)
    .attr('class', 'cases')
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .attr('d', cases);

  // Draw hospitalised area
  svg.append('path')
    .datum(dataset)
      .attr('class', 'hospitalised')
      .attr('d', hospitalised);

  d3n.html()
  const html = `
    <h2>Daily cases and daily hospital cases</h2>
    ${d3n.chartHTML()}
    <style>
      #cases {
    
      }
    </style>
  `;

  return html;

}