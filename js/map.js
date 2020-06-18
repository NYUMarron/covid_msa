const breakpointNewCase = [0.01, 5, 10, 25, 50, 100, 200, 500, 1500];
const breakpointTotalCase = [100, 500, 1000, 5000, 10000, 20000, 50000, 100000];

const breakpointTotalDeath = [];
const breakpointNewDeath = [0.01, 1, 2, 10, 50, 100];

function map(data, geoState, geoMSA, div, type) {
    // set the margin of the visualization
    const margin = {top: 0, right: 20, bottom: 40, left: 20};
    const visWidth = 550 - margin.left - margin.right;
    const visHeight = 450 - margin.top - margin.bottom;


    // create svg tag in the div (#cases) tag
    const svg = div.append('svg')
        .attr('id', 'svg-map')
        .attr('width', visWidth + margin.left + margin.right)
        .attr('height', visHeight + margin.top + margin.bottom);

    // create container (g tag) that would contain a linechart, grid, and axises
    const container = svg.append("g")
        .attr("transform", `translate(${margin.left}, -10)`)
        .attr('id', type + '_map');

    const projection = d3.geoAlbersUsa()
        .fitSize([visWidth, visHeight], geoMSA);

    const path = d3.geoPath().projection(projection);

    const breakPointArray = (type === 'case') ? breakpointNewCase : breakpointNewDeath;
    const colorArray = Array.from(d3.schemeYlOrRd[breakPointArray.length - 1]);
    colorArray.unshift('#8BC34A');


    console.log(breakPointArray);
    const cScale = d3.scaleThreshold()
        .domain(breakPointArray)
        .range(colorArray);
    store['cScaleMap_' + type] = cScale;

    container.selectAll('.state')
        .data(geoState.features.filter(d => d.properties.NAME !== 'Puerto Rico'))
        .join('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#DDDDDD');

    container.selectAll('.msa_' + type)
        .data(geoMSA.features)
        .join('path')
        .attr('class', 'msa_' + type)
        .attr('id', d => d.properties.NAME.replace(/\s/g, '').replace(/,/g, ""))
        .attr('d', path)
        .attr('fill', function (d) {
            const data_filtered = data.filter(g => g.msas === d.properties.NAME)[0];
            if (data_filtered !== undefined) {
                return cScale(data_filtered['2020-06-07']);
            } else {
                return '#FFFFFF';
            }
        })
        .attr('stroke', '#CCCCCC')
        .on('mouseover', function (d) {
            const coordinates = d3.mouse(this);
            const xPosition = coordinates[0] + 20;
            const yPosition = coordinates[1] + 20;
            console.log(d3.mouse(this));
            /*
            const tooltip = d3.select('#'+type+'_map')
                .append('g')
                .attr('id', 'tooltipMap')
                .attr('transform',`translate(${xPosition},${yPosition})`);

            tooltip.append('rect')
                .attr('x',0)
                .attr('y',0)
                .attr('width',200)
                .attr('height',50)
                .attr('stroke','#424242')
                .attr('fill','#FFFFFF');

            tooltip.append('text')
                .attr('x',5)
                .attr('y',15)
                .text(d.properties.NAME)
                .style('font-size','11px')
                .style('font-family','sans-serif')
                .attr('text-anchor','start');

             */
        })
        .on('mousemove', function (d) {
            d3.select(this)
                .attr('stroke', '#212121')
                .style('stroke-width', '2px');

            const coordinates = d3.mouse(this);
            const xPosition = coordinates[0] - 85;
            const yPosition = coordinates[1] - 55;
            d3.select('#tooltipMap')
                .attr('transform', `translate(${xPosition},${yPosition})`);
        })
        .on('mouseout', function (d) {
            if (d3.select(this).attr('class') !== 'clicked') {
                d3.select(this)
                    .attr('stroke', '#969696')
                    .style('stroke-width', '1px');
            }
            d3.select('#tooltipMap').remove();
        })
        .on('click', function (d) {
            document.getElementById("msa-select").value = d.properties.NAME;
            updateCaseLineChart();
        });
}

function updateMap(dateString, type) {

    d3.selectAll('.msa_' + type)
        .attr('fill', function (d) {
            const data_filtered = store[type + 'sDaily'].filter(g => g.msas === d.properties.NAME)[0];
            if (data_filtered !== undefined) {
                return store['cScaleMap_' + type](data_filtered[dateString]);
            } else {
                return '#FFFFFF';
            }
        })

}

function caseMapBtnClick(source){
    const selectedBtn = source.textContent;
    source.classList.add("map_btn-clicked");
    source.parentNode.querySelectorAll('button').forEach(function(d){
        if(d.textContent!==selectedBtn){
            d.classList.remove("map_btn-clicked");
        }
    })
}

function deathMapBtnClick(source){
    const selectedBtn = source.textContent;
    source.classList.add("map_btn-clicked");
    source.parentNode.querySelectorAll('button').forEach(function(d){
        if(d.textContent!==selectedBtn){
            d.classList.remove("map_btn-clicked");
        }
    })
}
