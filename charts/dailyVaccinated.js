const D3Node = require("d3-node");
const { colours } = require("./theme");

module.exports = (data) => {
  console.log("Generating vaccinations progress chart");

  const options = {
    selector: "#vaccinations",
    container: '<div id="container"><div id="vaccinations"></div></div>',
  };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  // Set up dimensions and options
  const dataset = data.vaccination;
  /*
  {
    dailyAvgDoses: 36802,
    dailyFullyVaccinated: 2912,
    date: '2021-11-24T00:00:00.000Z',
    estimatedFullyVaccinated: 3783087,
    estimatedDoses: 8031190,
    vaccineType: 'https://covid19ireland-geohive.hub.arcgis.com/',
    doses: 8067138,
    people: 3851364,
    fullyVaccinated: 3786011,
    boosters: null
  }*/

  const w = 400;
  const h = 300;
  const margin = { top: 10, right: 20, bottom: 30, left: 40 };

  // Set up scales
  const xScale = d3
    .scaleTime()
    .domain([
      d3.min(dataset, (d) => new Date(d.date)),
      d3.max(dataset, (d) => new Date(d.date)),
    ])
    .range([margin.left, w - margin.right]);

  const xBarScale = d3
    .scaleBand()
    .domain(dataset.map((d) => `${new Date(d.date)}`))
    .range([margin.left, w - margin.right])
    .paddingInner(0);

  // Scale Y to the weekly average line
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.doses)])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3
    .select(d3n.document.querySelector("#vaccinations"))
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale).tickPadding(5).tickSize(5).ticks(4);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(3)
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right))
    .tickFormat(d3.format(".3s"));

  svg
    .append("clipPath")
    .attr("id", "chart-area")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", w - margin.left - margin.right)
    .attr("height", h - margin.top - margin.bottom);

  // x axis
  svg
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${h - margin.bottom})`)
    .call(xAxis);

  svg.select(".x-axis").select(".domain").remove();

  svg.selectAll(".x-axis .tick line").attr("stroke", colours.darkGrey);

  svg.selectAll(".x-axis .tick text").attr("fill", colours.darkGrey);

  // y axis
  svg
    .append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  svg.select(".y-axis").select(".domain").remove();

  svg.select(".y-axis").select(".tick:first-of-type").remove();

  svg.selectAll(".y-axis .tick line").attr("stroke", colours.lightGrey);

  svg.selectAll(".y-axis .tick text").attr("fill", colours.darkGrey);

  // Total doses area
  const totalDosesArea = d3
    .area()
    .x((d) => xScale(new Date(d.date)))
    .y0(() => yScale.range()[0])
    .y1((d) => yScale(d.doses));

  svg
    .append("path")
    .datum(dataset)
    .attr("class", "total-doses")
    .attr("fill", colours.green10)
    .attr("d", totalDosesArea);

  // People fully vaccinated area
  const totalFullyVaccinatedArea = d3
    .area()
    .x((d) => xScale(new Date(d.date)))
    .y0(() => yScale.range()[0])
    .y1((d) => yScale(d.fullyVaccinated));

  svg
    .append("path")
    .datum(dataset)
    .attr("class", "fully-vaccinated")
    .attr("fill", colours.green50)
    .attr("d", totalFullyVaccinatedArea);

  // TODO: daily doses as lines

  // Daily vaccinations line
  const dailyVaccinationsLine = d3
    .line()
    .x((d) => xScale(new Date(d.date)))
    .y((d) => yScale(d.dailyAvgDoses * 100));

  svg
    .append("path")
    .datum(dataset)
    .attr("class", "daily-vaccinations-line")
    .attr("fill", "none")
    .attr("stroke-width", 0.25)
    //.attr("stroke-dasharray", 1)
    .attr("stroke", colours.darkGrey)
    .attr("d", dailyVaccinationsLine);

  // Set up bar containers
  const bars = svg.append("g").attr("id", "bars");

  // Hover bars
  const barGroups = bars
    .selectAll(".bar-group")
    .data(dataset, (d) => d.date)
    .enter()
    .append("g")
    .classed("bar-group", true);

  barGroups
    .append("rect")
    .classed("hover-bar", true)
    .attr("x", (d) => xBarScale(new Date(d.date)))
    .attr("y", margin.top)
    .attr("data-key", (d) => d.date)
    .attr("height", h - margin.bottom - margin.top)
    .attr("width", xBarScale.bandwidth())
    .attr("fill", "transparent");

  // Legend: Daily doses
  svg
    .append("rect")
    .attr("x", margin.left + 20)
    .attr("y", margin.top + 8)
    .style("fill", colours.green10)
    .attr("width", 10)
    .attr("height", 10);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 14)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Total doses");

  // Legend: Fully vaccinated
  svg
    .append("rect")
    .attr("x", margin.left + 20)
    .attr("y", margin.top + 28)
    .style("fill", colours.green50)
    .attr("width", 10)
    .attr("height", 10);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 34)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Fully vaccinated");

  // Legend: Daily doses
  const legendAvgLinePoints = [
    {
      x: margin.left + 20,
      y: margin.top + 53,
    },
    {
      x: margin.left + 30,
      y: margin.top + 53,
    },
  ];
  const legendAvgLine = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  svg
    .append("path")
    .datum(legendAvgLinePoints)
    .attr("class", "daily-vaccinations-line")
    .attr("fill", "none")
    .attr("stroke-width", 0.25)
    //.attr("stroke-dasharray", 2)
    .attr("stroke", colours.darkGrey)
    .attr("d", legendAvgLine);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 54)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Daily doses (x100)");

  d3n.html();
  const html = `
    <h2>Vaccinations progress</h2>
    <style>
      .vaccinations {
        position: relative;
      }
      .vaccinations .tick {
        pointer-events: none;
      }
      .vaccinations .hover-bar.active {
        fill: rgba(100,100,100,0.15);
      }
      .vaccinations .total-doses,
      .vaccinations .fully-vaccinated,
      .vaccinations .daily-vaccinations-line {
        pointer-events: none;
      }
    </style>
    <div class="vaccinations">
      ${d3n.chartHTML()}
      <div class="tooltip">
        <p class="date"></p>
        <p class="fully-vaccinated large"></p>
        <p class="doses small"></p>
        <p class="avg-doses small"></p>
      </div>
    </div>
    <script>
      (function () {
        const vaccinationBars = document.querySelector('#vaccinations #bars');
        const vaccinationTooltip = document.querySelector('.vaccinations .tooltip')
        const dateEl = document.querySelector('.vaccinations .tooltip .date');
        const fullyVaccinatedEl = document.querySelector('.vaccinations .tooltip .fully-vaccinated');
        const dosesEl = document.querySelector('.vaccinations .tooltip .doses');
        const avgDosesEl = document.querySelector('.vaccinations .tooltip .avg-doses');

        let dailyCasesRect;
        function clearCasesBars() {
          const allHoverBars = document.querySelectorAll('#vaccinations .hover-bar');
          for (let i = 0; i < allHoverBars.length; ++i) {
            allHoverBars[i].classList.remove('active');
          }
        }
        function vaccinationBarsMove(e) {
          clearCasesBars();
          if (e.target.matches(".hover-bar")) {
            const date = e.target.getAttribute('data-key');
            // Send event to the summary
            const event = new CustomEvent('show-date', { bubbles: true, detail: date });
            document.querySelector('body').dispatchEvent(event);

            // Set tooltip content
            const data = findByDate(date);
            if (data) {
              dateEl.innerText = formatDate(date);
              fullyVaccinatedEl.innerText = formatNumber(data.fv) + ' fully vaccinated';
              dosesEl.innerText = formatNumber(data.v) + ' total doses';
              avgDosesEl.innerText = formatNumber(data.vAvg) + ' doses per day';
            }
            // 
            // Highlight the bar
            const parentGroup = e.target.parentElement;
            e.target.classList.add('active');
            vaccinationTooltip.classList.add('active');
            // Position the tooltip
            const x = e.clientX - dailyCasesRect.x;
            const y = e.clientY - dailyCasesRect.y;
            // Check width of the tooltip
            const tooltipWidth = vaccinationTooltip.getBoundingClientRect().width;
            const tooltipHeight = vaccinationTooltip.getBoundingClientRect().height;
            const rightSide = x + tooltipWidth + 20;
            if (rightSide > dailyCasesRect.width) {
              vaccinationTooltip.style.left = x - 10 - tooltipWidth + 'px';
            } else {
              vaccinationTooltip.style.left = x + 10 + 'px';
            }
            vaccinationTooltip.style.top = y - (tooltipHeight) + 'px';
          }
        }
        
        vaccinationBars.addEventListener('mouseover', function(e) {
          vaccinationBars.classList.add('active');
          dailyCasesRect = document.querySelector('#vaccinations').getBoundingClientRect();
          vaccinationBars.addEventListener('mousemove', vaccinationBarsMove);
        });
        vaccinationBars.addEventListener('mouseleave', function() {
          // Remove mousemove listener from vaccinationBars
          clearCasesBars();
          vaccinationBars.classList.remove('active');
          vaccinationTooltip.classList.remove('active');
          vaccinationBars.removeEventListener('mousemove', vaccinationBarsMove);
          // Update summary
          const event = new CustomEvent('show-date', { bubbles: true, detail: null });
          document.querySelector('body').dispatchEvent(event);
        });
      })();
    </script>
  `;

  return html;
};
