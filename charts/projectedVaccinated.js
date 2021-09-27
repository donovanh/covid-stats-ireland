const D3Node = require("d3-node");
const { colours } = require("./theme");

module.exports = (data) => {
  console.log("Generating vaccinations projected chart");

  const options = {
    selector: "#projected-vaccinations",
    container:
      '<div id="container"><div id="projected-vaccinations"></div></div>',
  };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  // Set up dimensions and options
  const dataset = data.vaccination;

  // Establish target number of fully vaccinated
  // Establish vector
  // Is it (average daily doses / 2) per day?
  // const pop = data.irelandPop || 4970499;
  const pop = 4055500; // ADULTS estimated
  const estimatedGoalPop = Math.floor(pop * 0.95); // 95% of population

  // Current rate per day, calculate based on 7 day average
  let sevenDayTotalDoses = 0;
  for (let i = 1; i < 8; i++) {
    sevenDayTotalDoses += dataset[dataset.length - i].dailyAvgDoses;
  }
  const dosesPerDay = Math.floor(sevenDayTotalDoses / 7);

  const totalVaccinated = dataset[dataset.length - 1].fullyVaccinated;
  const peopleYetToVaccinate = estimatedGoalPop - totalVaccinated;
  const percentVaccinated = (totalVaccinated / pop) * 100;
  const numberofDaysTo95 = peopleYetToVaccinate / (dosesPerDay / 2);
  const estDuration95MS = numberofDaysTo95 * 24 * 60 * 60 * 1000;

  // Calculate target date
  const estimated95Date = new Date(new Date().getTime() + estDuration95MS);

  const w = 400;
  const h = 300;
  const margin = { top: 10, right: 20, bottom: 30, left: 40 };

  // Set up scales
  const xScale = d3
    .scaleTime()
    .domain([d3.min(dataset, (d) => new Date(d.date)), estimated95Date])
    .range([margin.left, w - margin.right]);

  // Scale Y to the weekly average line
  const yMax = Math.ceil(estimatedGoalPop / 1000000) * 1000000;

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([h - margin.bottom, margin.top]);

  // Draw containing svg
  const svg = d3
    .select(d3n.document.querySelector("#projected-vaccinations"))
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`);

  // Draw axes
  const xAxis = d3.axisBottom(xScale).tickPadding(5).tickSize(5).ticks(4);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues([0, 2500000, 5000000])
    .tickPadding(5)
    .tickSize(0 - (w - margin.left - margin.right))
    .tickFormat(d3.format(".2s"));

  const yAxis2 = d3
    .axisLeft(yScale)
    .tickValues([d3.max(dataset, (d) => d.fullyVaccinated)])
    .tickPadding(5)
    .tickSize(5 - (xScale(new Date()) - margin.left))
    .tickFormat(d3.format(".2s"));

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

  // y axis 2
  svg
    .append("g")
    .classed("y-axis-2", true)
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis2);

  svg.select(".y-axis-2").select(".domain").remove();

  svg
    .selectAll(".y-axis-2 .tick line")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", 1)
    .attr("stroke", colours.darkGrey);

  svg.selectAll(".y-axis-2 .tick text").attr("fill", colours.darkGrey);

  // Total doses area
  const totalDosesArea = d3
    .area()
    .x((d) => xScale(new Date(d.date)))
    .y0(() => yScale.range()[0])
    .y1((d) => yScale(d.estimatedFullyVaccinated));

  svg
    .append("path")
    .datum(dataset)
    .attr("class", "total-doses")
    .attr("fill", colours.green)
    .attr("d", totalDosesArea);

  // Projected line - extend from current day up to projected date
  const projectedDosesLineData = [
    {
      x: d3.max(dataset, (d) => new Date(d.date)),
      y: d3.max(dataset, (d) => d.estimatedFullyVaccinated),
    },
    {
      x: estimated95Date,
      y: estimatedGoalPop,
    },
  ];

  const projectedDosesLine = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  svg
    .append("path")
    .datum(projectedDosesLineData)
    .attr("class", "projected-vaccinations-line")
    .attr("fill", "none")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", 6)
    .attr("stroke", colours.darkGrey)
    .attr("d", projectedDosesLine);

  // Highlight the end of the estimated line
  svg
    .append("circle")
    .style("fill", colours.darkGrey)
    .attr("r", 2)
    .attr("cx", xScale(estimated95Date))
    .attr("cy", yScale(estimatedGoalPop));

  // Add info text about this estimate
  const formatNumber = (number) => Intl.NumberFormat("en-UK").format(number);
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", dateOptions);

  const text = svg
    .append("text")
    .attr("x", xScale(estimated95Date) - 150)
    .attr("y", yScale(estimatedGoalPop) + 3)
    .style("font-size", 10)
    .style("fill", colours.darkGrey);

  svg
    .append("text")
    .text(formatDate(estimated95Date) + "*")
    .attr("x", xScale(estimated95Date) - 10)
    .attr("y", yScale(estimatedGoalPop) + 3)
    .attr("dy", 0)
    .style("font-size", 10)
    .attr("text-anchor", "end")
    .style("fill", colours.darkGrey);

  svg
    .append("text")
    .text(
      "* based on 7-day average rate of " +
        formatNumber(dosesPerDay) +
        " doses per day"
    )
    .attr("x", w - margin.right)
    .attr("y", h - margin.bottom - 10)
    .attr("dy", 0)
    .style("font-size", 10)
    .attr("text-anchor", "end")
    .style("fill", colours.darkGrey);

  // Legend: Total fully vaccinated
  svg
    .append("rect")
    .attr("x", margin.left + 20)
    .attr("y", margin.top + 8)
    .style("fill", colours.green50)
    .attr("width", 10)
    .attr("height", 10);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 14)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Total fully vaccinated (" + percentVaccinated.toFixed(2) + "%)");

  // Legend: Projected rate
  const legendAvgLinePoints = [
    {
      x: margin.left + 20,
      y: margin.top + 38,
    },
    {
      x: margin.left + 30,
      y: margin.top + 28,
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
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", 2)
    .attr("stroke", colours.darkGrey)
    .attr("d", legendAvgLine);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 34)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Projected rate");

  // Legend: 'Target: 95% (' + formatNumber(estimatedGoalPop) + ' people)'
  svg
    .append("circle")
    .style("fill", colours.darkGrey)
    .attr("r", 2)
    .attr("cx", margin.left + 24)
    .attr("cy", margin.top + 53);

  svg
    .append("text")
    .attr("x", margin.left + 35)
    .attr("y", margin.top + 54)
    .attr("alignment-baseline", "middle")
    .style("fill", colours.darkGrey)
    .style("font-size", 10)
    .text("Target: 95% (" + formatNumber(estimatedGoalPop) + " 12+)");

  d3n.html();
  const html = `
    <h2>Herd immunity</h2>
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
            
            // Set tooltip content
            const date = e.target.getAttribute('data-key');
            const data = findByDate(date);
            if (data) {
              dateEl.innerText = formatDate(date);
              fullyVaccinatedEl.innerText = formatNumber(data.fv) + ' vaccinated';
              dosesEl.innerText = formatNumber(data.v) + ' total doses';
              avgDosesEl.innerText = formatNumber(data.vAvg) + ' daily doses';
            }
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
