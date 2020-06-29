function map(data, geoState, geoMSA, div, type) {
    // set the margin of the visualization
    const margin = {top: 0, right: 20, bottom: 0, left: 20};
    const visWidth = 700 - margin.left - margin.right;
    const visHeight = 450 - margin.top - margin.bottom;

    // create svg tag in the div (#cases) tag
    const svg = div.append('svg')
        .attr('id', 'svg-map')
        .attr('width', '100%')
        .attr("viewBox", `0 0 ${visWidth + margin.left + margin.right} ${visHeight + margin.top + margin.bottom}`);

    // create container (g tag) that would contain a linechart, grid, and axises
    const container = svg.append("g")
        .attr("transform", `translate(${margin.left}, -10)`)
        .attr('id', type + '_map');

    const projection = d3.geoAlbersUsa()
        .fitSize([visWidth, visHeight], geoMSA);

    const path = d3.geoPath().projection(projection);

    store[type + 'MapType'] = 'new_' + type + 's';
    store[type + 'Date'] = dateToString(store.date);

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
                return store.cScaleMap['new_'+type+'s'].cScale(data_filtered['2020-06-07']);
            } else {
                return '#FFFFFF';
            }
        })
        .attr('stroke', '#CCCCCC')
        .on('mouseover', function (d) {
            const coordinates = d3.mouse(this);
            const xPosition = coordinates[0] + 20;
            const yPosition = coordinates[1] + 20;
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
                    .attr('stroke', '#CCCCCC')
                    .style('stroke-width', '1px');
            }
            d3.select('#tooltipMap').remove();
        })
        .on('click', function (d) {
            document.getElementById("MSA-select-" + type).value = d.properties.NAME;
            updateLineChartDash(d.properties.NAME, type);
        });
    createMapLegend(type);
}

function updateMap(dateString, type, maptype) {
    const data = store[type][maptype];
    d3.selectAll('.msa_' + type)
        .attr('fill', function (d) {
            const data_filtered = data.filter(g => g.msas === d.properties.NAME)[0];
            if (data_filtered !== undefined) {
                return store['cScaleMap'][maptype]['cScale'](data_filtered[dateString]);
            } else {
                return '#FFFFFF';
            }
        });
    createMapLegend(type);
}

function caseMapBtnClick(source) {
    const selectedBtn = source.value;
    if (store['caseMapType'] !== selectedBtn) {
        store['caseMapType'] = selectedBtn;
    }
    source.classList.add("map_btn-clicked");
    source.parentNode.querySelectorAll('button').forEach(function (d) {
        if (d.value !== selectedBtn) {
            d.classList.remove("map_btn-clicked");
        }
    });
    updateMap(store.caseDate, 'case', store['caseMapType']);
}

function deathMapBtnClick(source) {
    const selectedBtn = source.value;
    if (store['deathMapType'] !== selectedBtn) {
        store['deathMapType'] = selectedBtn;
    }
    source.classList.add("map_btn-clicked");
    source.parentNode.querySelectorAll('button').forEach(function (d) {
        if (d.value !== selectedBtn) {
            d.classList.remove("map_btn-clicked");
        }
    });
    updateMap(store.deathDate, 'death', store['deathMapType']);
}

function createMapLegend(type){
    d3.select(`#map_${type}-legend`).html('');
    const breakPoint = Array.from(store.cScaleMap[store[`${type}MapType`]]['breakPoint']);
    breakPoint.unshift(0);
    const legends = d3.select(`#map_${type}-legend`)
                        .selectAll('div')
                        .data(breakPoint)
                        .join('div');

    legends.append('svg')
        .attr('width',15)
        .attr('height',15)
        .append('rect')
        .attr('x',0)
        .attr('y',0)
        .attr('width',15)
        .attr('height',15)
        .attr('fill',d=>store.cScaleMap[store[`${type}MapType`]]['cScale'](d));

    legends.append('p')
        .html((d,i)=>store.cScaleMap[store[`${type}MapType`]]['text'][i]);

    [0,1,2].forEach(d=>{
        d3.select(`#map_${type}-legend`)
        .append('div')});
}
