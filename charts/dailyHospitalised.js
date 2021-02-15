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

  // Prepare data to put inline
  const findByDate = (date, dataset) => dataset.find(d => {
    const dateObj = new Date(date);
    const compare1 = `${dateObj.getUTCFullYear()} ${dateObj.getUTCMonth()} ${dateObj.getUTCDate()}`;
    const dateObj2 = new Date(d.date);
    const compare2 = `${dateObj2.getUTCFullYear()} ${dateObj2.getUTCMonth()} ${dateObj2.getUTCDate()}`;
    return compare1 === compare2;
  });

  const tidiedData = dataset.map(d => {
    const hospitalDataForDate = findByDate(d.date, hospitalData);
    return {
      date: new Date(d.date),
      h: hospitalDataForDate ? hospitalDataForDate.hospitalisedCases : null,
      i: hospitalDataForDate ? hospitalDataForDate.icuCases : null,
      d: d.ConfirmedCovidDeaths
    };
  });

  const w = 800;
  const h = 300;
  const margin = ({ top: 10, right: 20, bottom: 30, left: 40 });

  // Set up scales
  const xScale = d3.scaleTime()
    .domain([
      d3.min(tidiedData, d => d.date),
      d3.max(tidiedData, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(tidiedData, d => d.h)])
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
    .attr('stroke',colours.lightGrey)

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
    .y1(d => yScale(d.h))

  // Draw hospitalised area
  svg.append('path')
    .datum(tidiedData)
      .attr('class', 'hospitalised')
      .attr('fill', colours.light)
      .attr('d', hospitalised);

  // Define icu as an area
  const icu = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.i))

  // Draw icu area
  svg.append('path')
    .datum(tidiedData)
      .attr('class', 'deaths')
      .attr('fill', colours.medium)
      .attr('d', icu);

  // Define deaths as an area
  const deaths = d3.area()
    .curve(d3.curveBasis)
    .x(d => xScale(d.date))
    .y0(() => yScale.range()[0])
    .y1(d => yScale(d.d))

  // Draw deaths area
  svg.append('path')
    .datum(tidiedData)
      .attr('class', 'deaths')
      .attr('fill', colours.veryDark)
      .attr('d', deaths);

  // Bar for catching hover
  svg.append('rect')
    .classed('hover-area', true)
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', w - margin.left - margin.right)
    .attr('height', h - margin.top - margin.bottom)
    .attr('fill', 'transparent');

  // Legend: Hospitalised
  svg.append('rect')
    .attr('x', margin.left + 20)
    .attr('y', margin.top + 8)
    .style('fill', colours.light)
    .attr('width', 10)
    .attr('height', 10);

  svg.append('text')
    .attr('x', margin.left + 35)
    .attr('y', margin.top + 14)
    .attr('alignment-baseline', 'middle')
    .style('fill', colours.darkGrey)
    .style('font-size', 10)
    .text('Hospitalised');

  // Legend: ICU
  svg.append('rect')
    .attr('x', margin.left + 20)
    .attr('y', margin.top + 28)
    .style('fill', colours.medium)
    .attr('width', 10)
    .attr('height', 10);

  svg.append('text')
    .attr('x', margin.left + 35)
    .attr('y', margin.top + 34)
    .attr('alignment-baseline', 'middle')
    .style('fill', colours.darkGrey)
    .style('font-size', 10)
    .text('ICU');

  // Legend: Deaths
  svg.append('rect')
    .attr('x', margin.left + 20)
    .attr('y', margin.top + 48)
    .style('fill', colours.veryDark)
    .attr('width', 10)
    .attr('height', 10);

  svg.append('text')
    .attr('x', margin.left + 35)
    .attr('y', margin.top + 54)
    .attr('alignment-baseline', 'middle')
    .style('fill', colours.darkGrey)
    .style('font-size', 10)
    .text('Deaths');

  d3n.html()
  const html = `
    <h2>Hospitalised, ICU and deaths</h2>
    <style>
      .hospitalised-chart {
        position: relative;
      }
      .hospitalised-chart .hover-bar {
        opacity: 0;
        transition: opacity 0.2s ease-out;
        position: absolute;
        width: 2px;
        background: rgba(100,100,100,0.15);
        pointer-events: none;
      }
      .hospitalised-chart .hover-bar.active {
        opacity: 1;
      }
    </style>
    <div class="hospitalised-chart">
      ${d3n.chartHTML()}
      <div class="hover-bar"></div>
      <div class="tooltip">
        <p class="date"></p>
        <p class="hosp"></p>
        <p class="icu"></p>
        <p class="deaths"></p>
      </div>
    </div>
    <script>
      // Shared data to show in summary also
      (function () {
        const area = document.querySelector('#hospitalised .hover-area');
        const tooltip = document.querySelector('.hospitalised-chart .tooltip');
        const hoverBar = document.querySelector('.hospitalised-chart .hover-bar');
        let rect;
        let areaRect;
        // Linear interpolation
        function convertRange( value, r1, r2 ) { 
          return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
        }
        
        function mouseMove(e) {
          if (!window.inlineData) return;
          const dataLength = window.inlineData.length;
          const day = Math.ceil(
            convertRange(
              e.clientX - areaRect.x,
              [0, areaRect.width],
              [0, dataLength]
            )
          ) - 1;
          // Put data inside tooltip
          // Send event to the summary
          const event = new CustomEvent('show-date', { bubbles: true, detail: window.inlineData[day].date });
          document.querySelector('body').dispatchEvent(event);

          if (window.inlineData[day]) {
            tooltip.classList.add('active');
            tooltip.querySelector('.date').innerText = formatDate(window.inlineData[day].date);
            tooltip.querySelector('.hosp').innerText = formatNumber(+(window.inlineData[day].h)) + ' hospitalised';
            tooltip.querySelector('.icu').innerText = formatNumber(+(window.inlineData[day].i)) + ' ICU';
            tooltip.querySelector('.deaths').innerText = formatNumber(+(window.inlineData[day].d)) + ' deaths';
          } else {
            tooltip.classList.remove('active');
          }
          // Place tooltip near cursor
          const x = e.clientX - rect.x;
          const y = e.clientY - rect.y;
          // Check width of the tooltip
          // If it's more than the distance to the right side, set the X accordingly
          const tooltipWidth = tooltip.getBoundingClientRect().width;
          const tooltipHeight = tooltip.getBoundingClientRect().height;
          const rightSide = x + tooltipWidth + 20;
          if (rightSide > rect.width) {
            tooltip.style.left = x - 10 - tooltipWidth + 'px';
          } else {
            tooltip.style.left = x + 10 + 'px';
          }
          tooltip.style.top = y - (tooltipHeight) + 'px';
          // Place hover bar
          hoverBar.style.left = x + 'px';
        }
        area.addEventListener('mouseenter', function() {
          rect = document.querySelector('#hospitalised').getBoundingClientRect();
          areaRect = area.getBoundingClientRect();
          tooltip.classList.add('active');
          hoverBar.classList.add('active');
          area.addEventListener('mousemove', mouseMove);
          // Set dimensions for .hospitalised-chart .hover-bar
          hoverBar.style.height = areaRect.height + 'px';
          hoverBar.style.top = areaRect.y - rect.y + 'px';
        });
        area.addEventListener('mouseleave', function() {
          tooltip.classList.remove('active');
          hoverBar.classList.remove('active');
          area.removeEventListener('mousemove', mouseMove);
          // Update summary
          const event = new CustomEvent('show-date', { bubbles: true, detail: null });
          document.querySelector('body').dispatchEvent(event);
        });
      })();
    </script>
  `;

  return html;

}