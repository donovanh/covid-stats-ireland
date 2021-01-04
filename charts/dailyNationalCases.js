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
  const h = 300;
  const margin = ({ top: 20, right: 30, bottom: 30, left: 40 });

  // Generate rolling 7-day average cases from today back
  // Put data into 7-day groups
  let cohort = [];
  const groups = data.national.reverse().reduce((acc, d, i) => {
    if (cohort.length === 0) {
      cohort.date = d.date;
    }
    if (cohort.length < 7) {
      cohort.push(d.ConfirmedCovidCases);

      if (i === data.national.length - 1) {
        acc.push(cohort);
      }
    } else {
      acc.push(cohort);
      cohort = [];
    }
    return acc;
  }, []);

  const sevenDayAverageNumbers = groups.reverse().map(group => {
    const sum = group.reduce((a, b) => a + b, 0);
    return sum / group.length;
  });

  // Add dates to the averages
  const sevenDayAverages = sevenDayAverageNumbers.map((d, i) => {
    return {
      date: new Date(groups[i].date),
      value: d
    }
  });

  // Set up scales
  const xScale = d3.scaleTime()
    .domain([
      d3.min(dataset, d => d.date),
      d3.max(dataset, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  const sevenDayAvgXScale = d3.scaleTime()
    .domain([
      d3.min(sevenDayAverages, d => d.date),
      d3.max(sevenDayAverages, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  // Scale Y to the weekly average line
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(sevenDayAverages, d => d.value) * 1.2])
    .range([h - margin.bottom - 10, margin.top]);

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

  // Define daily cases line
  const casesLine = d3.line()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y(d => yScale(d.ConfirmedCovidCases));

  // Draw total cases line
  svg.append('path')
    .datum(dataset)
    .attr('class', 'cases')
    .attr('fill', 'none')
    .attr('stroke-dasharray', '1')
    .attr('stroke', '#aaa')
    .attr('d', casesLine);

  // Define weekly average line
  const sevendayAvgLine = d3.line()
    .curve(d3.curveBasis)
    .x(d => sevenDayAvgXScale(d.date))
    .y(d => yScale(d.value));
  
  svg.append('path')
    .datum(sevenDayAverages)
    .attr('class', 'seven-day-avg')
    .attr('fill', 'none')
    .attr('stroke', '#333')
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

  // gradient.append('stop')
  //   .attr('offset', '20%')
  //   .attr('stop-color', 'rgba(255,255,255,1)');

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
    <h2>Daily cases and daily hospital cases</h2>
    <div style="max-width: ${w}px">
      ${d3n.chartHTML()}
    </div>
  `;

  return html;

}