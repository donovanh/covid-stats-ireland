const D3Node = require('d3-node');
const countyPaths = require('./irelandMap.js');

module.exports = ({ county: dataset }) => {

  console.log('Generating county map');

  const options = { selector: '#map', container: '<div id="container"><div id="map"></div></div>' }
  const d3n = new D3Node(options) // initializes D3 with container element
  const d3 = d3n.d3;

  const w = 605.68188;
  const h = 775.40155;
  const margin = ({ top: 20, right: 30, bottom: 30, left: 40 });

  // Draw containing svg
  const svg = d3.select(d3n.document.querySelector('#map'))
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`);

  const reds = ['#fff5f0','#fff4ef','#fff4ee','#fff3ed','#fff2ec','#fff2eb','#fff1ea','#fff0e9','#fff0e8','#ffefe7','#ffeee6','#ffeee6','#ffede5','#ffece4','#ffece3','#ffebe2','#feeae1','#fee9e0','#fee9de','#fee8dd','#fee7dc','#fee6db','#fee6da','#fee5d9','#fee4d8','#fee3d7','#fee2d6','#fee2d5','#fee1d4','#fee0d2','#fedfd1','#feded0','#feddcf','#fedccd','#fedbcc','#fedacb','#fed9ca','#fed8c8','#fed7c7','#fdd6c6','#fdd5c4','#fdd4c3','#fdd3c1','#fdd2c0','#fdd1bf','#fdd0bd','#fdcfbc','#fdceba','#fdcdb9','#fdccb7','#fdcbb6','#fdc9b4','#fdc8b3','#fdc7b2','#fdc6b0','#fdc5af','#fdc4ad','#fdc2ac','#fdc1aa','#fdc0a8','#fcbfa7','#fcbea5','#fcbca4','#fcbba2','#fcbaa1','#fcb99f','#fcb89e','#fcb69c','#fcb59b','#fcb499','#fcb398','#fcb196','#fcb095','#fcaf94','#fcae92','#fcac91','#fcab8f','#fcaa8e','#fca98c','#fca78b','#fca689','#fca588','#fca486','#fca285','#fca183','#fca082','#fc9e81','#fc9d7f','#fc9c7e','#fc9b7c','#fc997b','#fc987a','#fc9778','#fc9677','#fc9475','#fc9374','#fc9273','#fc9071','#fc8f70','#fc8e6f','#fc8d6d','#fc8b6c','#fc8a6b','#fc8969','#fc8868','#fc8667','#fc8565','#fc8464','#fb8263','#fb8162','#fb8060','#fb7f5f','#fb7d5e','#fb7c5d','#fb7b5b','#fb795a','#fb7859','#fb7758','#fb7657','#fb7455','#fa7354','#fa7253','#fa7052','#fa6f51','#fa6e50','#fa6c4e','#f96b4d','#f96a4c','#f9684b','#f9674a','#f96549','#f86448','#f86347','#f86146','#f86045','#f75e44','#f75d43','#f75c42','#f65a41','#f65940','#f6573f','#f5563e','#f5553d','#f4533c','#f4523b','#f4503a','#f34f39','#f34e38','#f24c37','#f24b37','#f14936','#f14835','#f04734','#ef4533','#ef4433','#ee4332','#ed4131','#ed4030','#ec3f2f','#eb3d2f','#eb3c2e','#ea3b2d','#e93a2d','#e8382c','#e7372b','#e6362b','#e6352a','#e5342a','#e43229','#e33128','#e23028','#e12f27','#e02e27','#df2d26','#de2c26','#dd2b25','#dc2a25','#db2924','#da2824','#d92723','#d72623','#d62522','#d52422','#d42321','#d32221','#d22121','#d12020','#d01f20','#ce1f1f','#cd1e1f','#cc1d1f','#cb1d1e','#ca1c1e','#c91b1e','#c71b1d','#c61a1d','#c5191d','#c4191c','#c3181c','#c2181c','#c0171b','#bf171b','#be161b','#bd161a','#bb151a','#ba151a','#b91419','#b81419','#b61419','#b51319','#b41318','#b21218','#b11218','#b01218','#ae1117','#ad1117','#ac1117','#aa1017','#a91016','#a71016','#a60f16','#a40f16','#a30e15','#a10e15','#a00e15','#9e0d15','#9c0d14','#9b0c14','#990c14','#970c14','#960b13','#940b13','#920a13','#900a13','#8f0a12','#8d0912','#8b0912','#890812','#870811','#860711','#840711','#820711','#800610','#7e0610','#7c0510','#7a0510','#78040f','#76040f','#75030f','#73030f','#71020e','#6f020e','#6d010e','#6b010e','#69000d','#67000d']

  const max = Math.ceil(d3.max(dataset, d => d.PopulationProportionCovidCases / 1000));

  const colScale = d3.scaleLinear()
    .domain([
      0,
      max
    ])
    .rangeRound([0, reds.length - 1]);

  for (const county of countyPaths) {
    if (county.name === 'Northern Ireland') {
      svg.append('path')
        .attr('name', county.name)
        .attr('stroke', '#888')
        .attr('stroke-width', 0.25)
        .attr('fill', '#fff')
        .attr('d', county.d);
      continue;
    }

    const countyData = dataset.find(item => item.CountyName === county.name)
    const popPropCases = countyData ? countyData.PopulationProportionCovidCases : 0;

    svg.append('path')
      .attr('name', county.name)
      .attr('class', 'county')
      .attr('id', county.name)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.25)
      .attr('fill', reds[colScale(popPropCases / 1000)])
      .attr('d', county.d)
      .attr('data-case-percent', Math.round(popPropCases / 100) / 10 + '%')
      .attr('data-cases', countyData.ConfirmedCovidCases.toLocaleString())
  }

  const legendGroup = svg.append('g')
    .classed('legend', true);

  const gradient = legendGroup.append('linearGradient')
    .attr('id', 'map-legend-gradient')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 1)
    .attr('y2', 0);

  const legendScale = d3.scaleLinear()
    .domain([0, 100])
    .rangeRound([0, reds.length]);

  //for (const [index, red] of reds.entries()) {
  for (let i = 0; i < 100; i++) {
    gradient.append('stop')
      .attr('offset', `${i}%`)
      .attr('stop-color', reds[legendScale(i)]);
  }

  // Add a legend
  const legendHeight = 140;

  legendGroup.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('stroke', '#eee')
    .attr('width', 20)
    .attr('height', legendHeight)
    .attr('fill', 'url(#map-legend-gradient)');

    const legendAxisScale = d3.scaleLinear()
    .domain([max, 0])
    .range([4, legendHeight - 4]);

  const legendAxis = d3.axisRight()
    .scale(legendAxisScale)
    .tickSize(0)
    .tickPadding(4)
    .ticks(2)
    .tickFormat(d => `${d}%`);

  legendGroup.append('g')
    .classed('legend-axis', true)
    .attr('transform', `translate(${margin.left + 20}, ${margin.top})`)
    .call(legendAxis);

  legendGroup.select('.domain')
    .remove();

  d3n.html()
  const html = `
    <style>
      .map-wrapper {
        position: relative;
      }

      .map-tooltip {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(255,255,255,0.8);
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
        opacity: 0;
        transition: opacity 0.2s ease-out;
        padding: 10px;
        min-width: 150px;
      }

      .map-tooltip p {
        margin: 0;
      }

      .county {
        transition: opacity 0.2s ease-out;
      }

      .map-tooltip.active {
        opacity: 1;
      }

      #map.is-active .county:not(.active) {
        opacity: 0.75;
      }

      #map.is-active .county.active {
        opacity: 1;
      }
    </style>
    <h2>Cases by county, per 100k population</h2>
    <div class="map-wrapper" style="max-width: ${w}px">
      ${d3n.chartHTML()}
      <div class="map-tooltip">
        <p class="county-name"></p>
        <p class="county-stat"></p>
      </div>
    </div>
    <script>
      const counties = [...document.querySelectorAll('.county')];
      const map = document.querySelector('#map');
      const mapTooltip = document.querySelector('.map-tooltip');
      const mapCountyName = document.querySelector('.map-tooltip .county-name');
      const mapCountyStat = document.querySelector('.map-tooltip .county-stat');
      let mapListenerTimeout;
      // Mouse functions
      const showTooltip = (e) => {
        e.target.classList.add('active');
        mapTooltip.classList.add('active');
        map.classList.add('is-active');
        // Add mousemove event
        document.addEventListener('mousemove', moveMouse);
        // Set the tooltip content
        mapCountyName.innerText = e.target.getAttribute('name');
        mapCountyStat.innerText = e.target.getAttribute('data-case-percent') + ' (' + e.target.getAttribute('data-cases') + ' cases)';
      }
      const hideTooltip = (e) => {
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
      const moveMouse = (e) => {
        const mapRect = map.getBoundingClientRect();
        const x = e.clientX - mapRect.x;
        const y = e.clientY - mapRect.y;
        mapTooltip.style.left = x + 'px';
        mapTooltip.style.top = y + 'px';
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