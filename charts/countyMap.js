const D3Node = require("d3-node");
const countyPaths = require("./irelandMap.js");
const { colours } = require("./theme");

module.exports = ({ county: dataset, northernIreland }) => {
  console.log("Generating county map");

  const options = {
    selector: "#map",
    container: '<div id="container"><div id="map"></div></div>',
  };
  const d3n = new D3Node(options); // initializes D3 with container element
  const d3 = d3n.d3;

  const w = 605.68188;
  const h = 775.40155;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };

  // Draw containing svg
  const svg = d3
    .select(d3n.document.querySelector("#map"))
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`);

  const max = Math.ceil(
    d3.max(dataset, (d) => d.PopulationProportionCovidCases / 1000)
  );

  const colScale = d3
    .scaleLinear()
    .domain([0, max])
    .rangeRound([0, colours.reds.length - 1]);

  for (const county of countyPaths) {
    if (county.name === "Northern Ireland") {
      const { totalCases, per100k } = northernIreland;
      svg
        .append("path")
        .attr("name", county.name)
        .attr("id", county.name)
        .attr("class", "county")
        .attr("stroke", "#888")
        .attr("stroke-width", 0.25)
        .attr("fill", "rgba(255,255,255,0)")
        .attr("d", county.d);
      continue;
    }

    const countyData = dataset.find((item) => item.CountyName === county.name);
    const popPropCases = countyData
      ? countyData.PopulationProportionCovidCases
      : 0;
    svg
      .append("path")
      .attr("name", county.name)
      .attr("class", "county")
      .attr("id", county.name)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.25)
      .attr("fill", colours.reds[colScale(popPropCases / 1000)])
      .attr("d", county.d)
      .attr("data-case-percent", Math.round(popPropCases / 100) / 10 + "%")
      .attr(
        "data-cases",
        countyData.ConfirmedCovidCases
          ? countyData.ConfirmedCovidCases.toLocaleString()
          : 0
      );
  }

  const legendGroup = svg.append("g").classed("legend", true);

  const gradient = legendGroup
    .append("linearGradient")
    .attr("id", "map-legend-gradient")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 1)
    .attr("y2", 0);

  const legendScale = d3
    .scaleLinear()
    .domain([0, 100])
    .rangeRound([0, colours.reds.length]);

  //for (const [index, red] of colours.reds.entries()) {
  for (let i = 0; i < 100; i++) {
    gradient
      .append("stop")
      .attr("offset", `${i}%`)
      .attr("stop-color", colours.reds[legendScale(i)]);
  }

  // Add a legend
  const legendHeight = 140;

  legendGroup
    .append("rect")
    .attr("x", margin.left + 50)
    .attr("y", margin.top + 10)
    .attr("stroke", "#eee")
    .attr("width", 20)
    .attr("height", legendHeight)
    .attr("fill", "url(#map-legend-gradient)");

  const legendAxisScale = d3
    .scaleLinear()
    .domain([max, 0])
    .range([0, legendHeight]);

  const legendAxis = d3
    .axisRight()
    .scale(legendAxisScale)
    .tickSize(4)
    .tickPadding(4)
    .ticks(4)
    .tickFormat((d) => `${d}%`);

  legendGroup
    .append("g")
    .classed("legend-axis", true)
    .attr("transform", `translate(${margin.left + 70}, ${margin.top + 10})`)
    .call(legendAxis);

  legendGroup.select(".domain").remove();

  d3n.html();
  const html = `
    <style>
      .map-wrapper {
        position: relative;
      }
      .county {
        transition: opacity 0.2s ease-out;
      }
      #map.is-active .county:not(.active) {
        opacity: 0.75;
      }
      #map.is-active .county.active {
        opacity: 1;
      }
    </style>
    <h2>Percentage of population per county</h2>
    <div class="map-wrapper" style="max-width: ${w}px">
      ${d3n.chartHTML()}
      <div class="tooltip">
        <p class="county-name date"></p>
        <p class="county-stat large"></p>
        <p class="county-cases small"></p>
      </div>
    </div>
    <script>
      const counties = [...document.querySelectorAll('.county')];
      const map = document.querySelector('#map');
      const mapTooltip = document.querySelector('.map-wrapper .tooltip');
      const mapCountyName = document.querySelector('.map-wrapper .tooltip .county-name');
      const mapCountyStat = document.querySelector('.map-wrapper .tooltip .county-stat');
      const mapCountyCases = document.querySelector('.map-wrapper .tooltip .county-cases');
      let mapListenerTimeout;
      // Mouse functions
      function showTooltip(e) {
        e.target.classList.add('active');
        mapTooltip.classList.add('active');
        map.classList.add('is-active');
        // Add mousemove event
        document.addEventListener('mousemove', moveMouse);
        // Set the tooltip content
        mapCountyName.innerText = e.target.getAttribute('name');
        mapCountyStat.innerText = e.target.getAttribute('data-case-percent');
        if (e.target.getAttribute('data-cases')) {
          mapCountyCases.innerText = e.target.getAttribute('data-cases') + ' cases';
        } else {
          mapCountyCases.innerText = '';
        }
      }
      function hideTooltip(e) {
        e.target.classList.remove('active');
        mapTooltip.classList.remove('active');
        map.classList.remove('is-active');
        // Remove mousemove event, if there's no "active" county
        setTimeout(() => {
          const activeCounty = document.querySelector('.county.active');
          if (!activeCounty) {
            if (mapListenerTimeout) {
              document.removeEventListener('mousemove', moveMouse);
            }
          }
        }, 150);
      }
      function moveMouse(e) {
        const mapRect = map.getBoundingClientRect();
        const x = e.clientX - mapRect.x;
        const y = e.clientY - mapRect.y;
        const tooltipHeight = mapTooltip.getBoundingClientRect().height;
        mapTooltip.style.left = x + 3 + 'px';
        mapTooltip.style.top = y - tooltipHeight - 3 + 'px';
      };
      for (let i = 0; i < counties.length; i++) {
        const county = counties[i];
        // Add event listener for hover
        county.addEventListener('mouseenter', showTooltip);
        county.addEventListener('mouseout', hideTooltip);
      }
    </script>
  `;

  return html;
};
