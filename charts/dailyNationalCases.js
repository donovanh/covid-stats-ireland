const D3Node = require('d3-node');
const { colours } = require('./theme');

module.exports = (data) => {

  console.log('Generating national chart');

  const options = { selector: '#cases', container: '<div id="container"><div id="cases"></div></div>' };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  // Set up dimensions and options
  const dataset = data.national.map(d => ({
    ...d,
    date: new Date(d.date)
  }));
  dataset.shift(); // Remove the first day as there's a gap after it

  const w = 800;
  const h = 300;
  const margin = ({ top: 10, right: 40, bottom: 30, left: 40 });

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
    .paddingInner(0);

  const sevenDayAvgXScale = d3.scaleTime()
    .domain([
      d3.min(sevenDayAverages, d => d.date),
      d3.max(sevenDayAverages, d => d.date)
    ])
    .range([margin.left, w - margin.right]);

  // Scale Y to the weekly average line
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.ConfirmedCovidCases)])
    .range([h - margin.bottom, margin.top]);

  // Second scale for vaccination numbers
  const vaccinationDataset = data.vaccination;

  // TODO: Check when dailyAvgFullyVaccinated becomes viable
  const yScale2 = d3.scaleLinear()
    .domain([0, d3.max(vaccinationDataset, d => d.dailyAvgDoses)])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#cases'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale)
    .tickPadding(5)
    .tickSize(5);

  const yAxis = d3.axisLeft(yScale)
    .ticks(3)
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right));

  const yAxis2 = d3.axisRight(yScale2)
    .tickValues([d3.max(vaccinationDataset, d => d.dailyAvgDoses)])
    .tickPadding(2)
    .tickSize(5)
    .tickFormat(d3.format(',.2r'));

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

  svg.selectAll('.y-axis .tick line')
    .attr('stroke', colours.lightGrey);

  // y axis 2
  svg.append('g')
    .classed('y-axis-2', true)
    .attr('transform', `translate(${w - margin.right}, 0)`)
    .call(yAxis2);

  svg.select('.y-axis-2')
    .select('.domain')
    .remove();

  svg.selectAll('.y-axis-2 .tick line')
    .attr('stroke', colours.green50);

  svg.selectAll('.y-axis-2 .tick text')
    .attr('fill', colours.green);

  // X axis 
  svg.selectAll('.x-axis .tick line')
    .attr('stroke', colours.darkGrey)

  svg.selectAll('.y-axis .tick text')
    .attr('fill', colours.darkGrey)

  svg.selectAll('.x-axis .tick text')
    .attr('fill', colours.darkGrey)

  const bars = svg
    .append('g')
    .attr('id', 'bars');

  const barGroups = bars.selectAll('.bar-group')
    .data(dataset, (d) => d.date)
    .enter()
    .append('g')
    .classed('bar-group', true);

  const getVaccinationForDate = (date) => {
    const result = vaccinationDataset.find(d => {
      const date1 = new Date(d.date);
      const compare1 = `${date1.getUTCFullYear()} ${date1.getUTCMonth()} ${date1.getUTCDate()}`;
      const date2 = new Date(date);
      const compare2 = `${date2.getUTCFullYear()} ${date2.getUTCMonth()} ${date2.getUTCDate()}`;
      return compare1 === compare2
    });
    return result || {};
  }

  barGroups
    .append('rect')
    .classed('hover-bar', true)
    .attr('x', (d) => xBarScale(d.date))
    .attr('y', margin.top)
    .attr('data-key', d => d.date)
    .attr('data-cases', d => d.ConfirmedCovidCases)
    .attr('data-avg', (d, i) => sevenDayAverages[i].value)
    .attr('data-vac-doses-avg', d => getVaccinationForDate(d.date).dailyAvgDoses)
    .attr('data-vac-doses-total', d => getVaccinationForDate(d.date).doses)
    .attr('height', h - margin.bottom - margin.top)
    .attr('width', xBarScale.bandwidth())
    .attr('fill', 'transparent');

  barGroups.append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xBarScale(d.date) + xBarScale.bandwidth() / 4)
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
    .attr('stroke', colours.darkerGrey)
    .attr('d', sevendayAvgLine);

  // Add overlay for vaccines
  const vaccinationsArea = d3.area()
    .x(d => (xScale(new Date(d.date))))
    .y0(() => yScale2.range()[0])
    .y1(d => yScale2(d.dailyAvgDoses));

  // Draw cases by age area
  svg.append('path')
    .datum(vaccinationDataset)
    .attr('class', 'vaccinations')
    .attr('fill', colours.green10)
    .attr('d', vaccinationsArea);

  const vaccinationsLine = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale2(d.dailyAvgDoses));

  svg.append('path')
    .datum(vaccinationDataset)
    .attr('class', 'vaccinations-line')
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    .attr('stroke', colours.green50)
    .attr('d', vaccinationsLine);

  d3n.html()
  const html = `
    <h2>Daily cases</h2>
    <style>
      .daily-cases {
        position: relative;
      }
      .daily-cases .bar,
      .daily-cases .seven-day-avg,
      .fade-out,
      .daily-cases .tick {
        pointer-events: none;
      }
      .daily-cases .hover-bar.active {
        fill: rgba(100,100,100,0.15);
      }
      #bars .bar {
        transition: opacity 0.2s ease-out;
      }
      #bars.active .bar {
        opacity: 0.5;
      }
      #bars .bar.active {
        opacity: 1;
        fill: ${colours.medium};
      }
      .daily-cases .vaccinations,
      .daily-cases .vaccinations-line {
        pointer-events: none;
      }
    </style>
    <div class="daily-cases">
      ${d3n.chartHTML()}
      <div class="tooltip">
        <p class="date"></p>
        <p class="cases large"></p>
        <p class="average small"></p>
        <p class="vac-per-day small"></p>
      </div>
    </div>
    <script>
      const dailyCasesBars = document.querySelector('#cases #bars');
      const dailyCasesTooltip = document.querySelector('.daily-cases .tooltip')
      const casesDateEl = document.querySelector('.daily-cases .tooltip .date');
      const casesCasesEl = document.querySelector('.daily-cases .tooltip .cases');
      const casesAvgEl = document.querySelector('.daily-cases .tooltip .average');
      const vacPerDayEl = document.querySelector('.daily-cases .tooltip .vac-per-day');

      let dailyCasesRect;
      function clearCasesBars() {
        const allHoverBars = document.querySelectorAll('#cases .hover-bar');
        const allBars = document.querySelectorAll('#cases .bar');
        for (let i = 0; i < allHoverBars.length; ++i) {
          allHoverBars[i].classList.remove('active');
          allBars[i].classList.remove('active');
        }
      }
      function dailyCasesBarsMove(e) {
        clearCasesBars();
        if (e.target.matches(".hover-bar")) {
          // Send event to the summary
          const event = new CustomEvent('show-date', { bubbles: true, detail: e.target.getAttribute('data-key') });
          document.querySelector('body').dispatchEvent(event);
          // Set tooltip content
          const cases = formatNumber(+(e.target.getAttribute('data-cases')));
          const average = formatNumber(Math.round(+(e.target.getAttribute('data-avg'))));
          const date = formatDate(e.target.getAttribute('data-key'));
          const casesText = cases === '1' ? ' case' : ' cases';
          const vacPerDay = formatNumber(+(e.target.getAttribute('data-vac-doses-avg')));
          casesDateEl.innerText = date;
          casesCasesEl.innerText = cases + casesText;
          casesAvgEl.innerText = average +' (7-day average)';
          vacPerDayEl.innerText = vacPerDay +' (vaccines per day)';
          // Highlight the bar
          const parentGroup = e.target.parentElement;
          const bar = parentGroup.querySelector('.bar');
          bar.classList.add('active');
          e.target.classList.add('active');
          dailyCasesTooltip.classList.add('active');
          // Position the tooltip
          const x = e.clientX - dailyCasesRect.x;
          const y = e.clientY - dailyCasesRect.y;
          // Check width of the tooltip
          // If it's more than the distance to the right side, set the X accordingly
          // console.log(dailyCasesTooltip.getBoundingClientRect())
          const tooltipWidth = dailyCasesTooltip.getBoundingClientRect().width;
          const tooltipHeight = dailyCasesTooltip.getBoundingClientRect().height;
          const rightSide = x + tooltipWidth + 20;
          if (rightSide > dailyCasesRect.width) {
            dailyCasesTooltip.style.left = x - 10 - tooltipWidth + 'px';
          } else {
            dailyCasesTooltip.style.left = x + 10 + 'px';
          }
          dailyCasesTooltip.style.top = y - (tooltipHeight) + 'px';
        }
      }
      dailyCasesBars.addEventListener('mouseover', function(e) {
        dailyCasesBars.classList.add('active');
        dailyCasesRect = document.querySelector('#cases').getBoundingClientRect();
        dailyCasesBars.addEventListener('mousemove', dailyCasesBarsMove);
      });
      dailyCasesBars.addEventListener('mouseleave', function() {
        // Remove mousemove listener from dailyCasesBars
        clearCasesBars();
        dailyCasesBars.classList.remove('active');
        dailyCasesTooltip.classList.remove('active');
        dailyCasesBars.removeEventListener('mousemove', dailyCasesBarsMove);
        // Update summary
        const event = new CustomEvent('show-date', { bubbles: true, detail: null });
        document.querySelector('body').dispatchEvent(event);
      });
    </script>
  `;

  return html;

}