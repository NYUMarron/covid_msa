let pasthoveredDate;

function lineChartDash(data, dataDaily, msa, div, type) {

    // store msa value that user selected
    store.msa = msa;

    // filter dataset by selected msa area
    const dataFiltered = data.filter(d => d['msas'] === msa)[0];
    const dataFilteredDaily = dataDaily.filter(d => d['msas'] === msa)[0];

    // transform the dataset for d3 visualization
    let dataTransformed = caseDataPrepDash(dataFiltered);
    let dataTransformedDaily = caseDataPrepDash(dataFilteredDaily);

    const timeEndDaily = d3.max(dataTransformedDaily.map(d => d.date));
    const timeEndTotal = d3.max(dataTransformed.map(d => d.date));
    const timeEnd = d3.min([timeEndDaily, timeEndTotal]);
    const timeStart = subtractDays(timeEnd,90);

    dataTransformed = dataTransformed.filter(d => d.date <= timeEnd);
    dataTransformedDaily = dataTransformedDaily.filter(d => d.date <= timeEnd);

    store.date = timeEnd;
    d3.select('#date_start_'+type).html(dateToMonthDay(timeStart));
    d3.select('#date_end_'+type).html(dateToMonthDay(timeEnd));

    // calculate maximum of cases or deaths and date
    let maxCase = d3.max(dataTransformed.map(d => d.cases));
    let maxCaseDaily = d3.max(dataTransformedDaily.map(d => d.cases));
    const maxDate = dataTransformedDaily.filter(d => d.cases === maxCaseDaily)[0]['date'];

    // set the margin of the visualization
    const margin = {top: 160, right: 60, bottom: 140, left: 60};
    const visWidth = 440 - margin.left - margin.right;
    const visHeight = 440 - margin.top - margin.bottom;

    // create svg tag in the div (#cases) tag
    const svg = div.append('svg')
        .attr('id', 'svg-LineChart-' + type)
        .attr('width', visWidth + margin.left + margin.right)
        .attr('height', visHeight + margin.top + margin.bottom);

    // create container (g tag) that would contain a linechart, grid, and axises
    const container = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr('id', type + '-chart-dash');

    // create empty rectangle. This is for hovering action on the line chart
    container.append('rect')
        .attr('class', 'overlay')
        .attr('id', type + '-dash-overlay-dash')
        .attr('x', 0)
        .attr('width', visWidth + 5)
        .attr('height', visHeight)
        .style('fill', 'none')
        .style('pointer-events', 'all');

    // set the xScale and Axis based on the temporal range
    const xScale = d3.scaleTime()
        .domain([timeStart, timeEnd])
        .range([0, visWidth]);

    // set the xAxis based on xScale
    const xAxis = d3.axisBottom(xScale);

    // set the yScale and yAxis based on maximum value of cases or deaths
    let yScale;
    let yScaleDaily;
    if (maxCase < 1) {
        yScale = d3.scaleLinear()
            .domain([0, 1]).nice()
            .range([visHeight, 0]);
        yScaleDaily = yScale;
    } else if (maxCaseDaily < 1) {
        yScale = d3.scaleLinear()
            .domain([0, maxCase]).nice()
            .range([visHeight, 0]);
        yScaleDaily = yScale;
    } else {
        yScale = d3.scaleLinear()
            .domain([0, maxCase]).nice()
            .range([visHeight, 0]);

        yScaleDaily = d3.scaleLinear()
            .domain([0, maxCaseDaily]).nice()
            .range([visHeight, 0]);
    }

    const yAxisTotal = d3.axisRight(yScale);
    const yAxisDaily = d3.axisLeft(yScaleDaily);

    // Create grid lines and axises
    caseAxisDash(container, xScale, yScale, yScaleDaily, xAxis, yAxisTotal, yAxisDaily, timeEnd, visWidth, visHeight);

    // this function is for drawing line graph
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.cases));

    const lineDaily = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleDaily(d.cases));

    // set the line color
    const lineColor = {
        'case': '#37474F',
        'death': '#37474F'
    };

    // draw the line graph
    container.append('g')
        .attr('class', 'path-lineChart')
        .append('path')
        .datum(dataTransformed)
        .attr('fill', 'none')
        .attr('stroke', lineColor[type])
        .attr('stroke-width', 2)
        .attr('d', line)
        .style('stroke-dasharray', '4,2')
        .style('stroke-opacity', '0.7');

    container.append('g')
        .attr('class', 'path-lineChart-daily')
        .append('path')
        .datum(dataTransformedDaily)
        .attr('fill', 'none')
        .attr('stroke', lineColor[type])
        .attr('stroke-width', 2)
        .attr('d', lineDaily);

    const circlesDaily = container.append('g')
        .attr('class', 'pointsDaily');

    circlesDaily.selectAll('circle')
        .data(dataTransformedDaily)
        .join('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScaleDaily(d.cases))
        .attr('class', 'circles_' + type)
        .attr('id', d => type + '-daily-' + d.date.getFullYear() + '-' + (d.date.getMonth() + 1) + '-' + d.date.getDate())
        .attr('fill', '#EF5350')
        .attr('r', 0);

    circlesDaily.select('#' + type + '-daily-' + timeEnd.getFullYear() + '-' + (timeEnd.getMonth() + 1) + '-' + timeEnd.getDate())
        .transition()
        .attr('r', 3);

    const circlesTotal = container.append('g')
        .attr('class', 'pointsTotal');

    circlesTotal.selectAll('circle')
        .data(dataTransformed)
        .join('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.cases))
        .attr('class', 'circles_' + type)
        .attr('id', d => type + '-total-' + d.date.getFullYear() + '-' + (d.date.getMonth() + 1) + '-' + d.date.getDate())
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#EF7373')
        .attr('r', 0);

    circlesTotal.select('#' + type + '-total-' + timeEnd.getFullYear() + '-' + (timeEnd.getMonth() + 1) + '-' + timeEnd.getDate())
        .transition()
        .attr('r', 3);

    const value= dataTransformedDaily.filter(d=> d.date.getTime()===timeEnd.getTime())[0]['cases'];
    const valueTotal = dataTransformed.filter(d=> d.date.getTime()===timeEnd.getTime())[0]['cases'];

    createTitle(svg, msa, type, dateToMonthDay(timeEnd)+', '+timeEnd.getFullYear());
    createLegend(svg, lineColor, type);
    createFigure(svg, value, valueTotal, type);
}

function caseDataPrepDash(data) {
    // extract dates of the dataset
    const dateArray = Object.keys(data).filter(d => (d !== 'msas') & (d !== 'category'));
    // transform the dataset for the d3 visualization
    let dataTransformed = dateArray.map(function (d) {
        let obj = {};
        obj.date = d3.timeParse('%Y-%m-%d')(d);
        obj.cases = data[d];
        return obj
    });

    const timeEnd = d3.max(dataTransformed.map(d => d.date));
    const timeStart = subtractDays(timeEnd, 90);

    dataTransformed = dataTransformed.sort((a, b) => d3.ascending(a, b));

    dataTransformed = dataTransformed.filter(d => d.date >= timeStart);

    return dataTransformed;
}

function caseAxisDash(container, xScale, yScale, yScaleDaily, xAxis, yAxisTotal, yAxisDaily, timeEnd, visWidth, visHeight) {

    const grid = container.append('g')
        .attr('class', 'grid');

    grid.append('g')
        .attr('transform', `translate(0,${visHeight})`)
        .call(xAxis.ticks(5));

    const yAxisLeft = grid.append('g')
        .call(yAxisDaily.ticks(3));

    yAxisLeft.select('g').select('line').remove();

    const yAxisRight = grid.append('g')
        .attr('transform', `translate(${visWidth},0)`)
        .call(yAxisTotal.ticks(3));

    yAxisRight.select('g').select('line').remove();

    grid.selectAll('line')
        .attr('stroke', '#424242');


    grid.append('line')
        .attr('transform', `translate(0,${visHeight})`)
        .attr('class', 'axis')
        .attr('x1', 0)
        .attr('x2', xScale(timeEnd))
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#424242');

    grid.append('line')
        .attr('transform', `translate(0,0)`)
        .attr('class', 'axis')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', yScale(0))
        .attr('stroke', '#424242');

    grid.append('line')
        .attr('transform', `translate(${visWidth},0)`)
        .attr('class', 'axis')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', yScale(0))
        .attr('stroke', '#424242');

    // below part is for creating grid lines. I brought this from https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
    // grid lines in x axis function
    function make_x_gridlines() {
        return d3.axisBottom(xScale)
            .ticks(8)
    }

// grid lines in y axis function

    function make_y_gridlines() {
        return d3.axisLeft(yScaleDaily)
            .ticks(3)
    }

    grid.append("g")
        .attr("class", "sub-grid-x")
        .attr("transform", "translate(0," + visHeight + ")")
        .call(make_x_gridlines()
            .tickSize(-visHeight)
            .tickFormat(""));

    grid.append("g")
        .attr("class", "sub-grid-y")
        .call(make_y_gridlines()
            .tickSize(-visWidth)
            .tickFormat("")
        );

    grid.selectAll('.sub-grid-x').selectAll('line')
        .attr('stroke', '#BBBBBB')
        .style('stroke-dasharray', '3 3');

    grid.selectAll('.sub-grid-y').selectAll('line')
        .attr('stroke', '#BBBBBB')
        .style('stroke-dasharray', '3 1');

    grid.selectAll('.domain').remove();
}

function dateToString(date) {
    return monthToString[(date.getMonth() + 1)] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

function createLegend(svg, lineColor, type) {
    const legend = svg.append('g')
        .attr('transform', 'translate(200,125)')
        .style('font-size', '12px');

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', lineColor[type])
        .style('stroke-width', '2px');

    legend.append('text')
        .attr('x', 35)
        .attr('y', 4)
        .text('New cases');

    legend.append('line')
        .attr('x1', 130)
        .attr('x2', 160)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', lineColor[type])
        .style('stroke-width', '2px')
        .style('stroke-dasharray', '4,2')
        .style('stroke-opacity', '0.5');

    legend.append('text')
        .attr('x', 165)
        .attr('y', 4)
        .text('Total cases');
}

function createTitle(svg, msa, type, date) {
    const title = svg.append('g')
        .attr('transform', 'translate(15,60)');

    title.append('text')
        .attr('id', 'linechart-' + type + '__Date')
        .text(date)
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', '18px');

    title.append('text')
        .text(msa)
        .attr('x', 0)
        .attr('y', 25)
        .style('font-size', '14px');

    title.append('text')
        .text('Population: ' + (19979477).toLocaleString())
        .attr('x', 0)
        .attr('y', 45)
        .style('font-size', '14px');
}

function createFigure(svg, value, valueTotal, type){
    const figureList = ['New cases:',
        'Days from peak:',
        'Total cases:',
        'Share of peak value:',
        'Duration:',
        'Five day change (%):'];

    const figure = svg.append('g')
        .attr('id', 'figure')
        .attr('transform', 'translate(15,330)');

    figure.selectAll('.figure')
        .data(figureList)
        .join('text')
        .attr('class', '.figure')
        .attr('x', (d, i) => (i % 2) * 180)
        .attr('y', (d, i) => Math.round((i + 1) / 2) * 30)
        .text(d => d)

    figure.append('text')
        .attr('id',type+'Daily')
        .attr('class','.figure')
        .attr('x',90)
        .attr('y',31)
        .text(Math.round(value).toLocaleString());

    figure.append('text')
        .attr('id',type+'Total')
        .attr('class','.figure')
        .attr('x',90)
        .attr('y',61)
        .text(Math.round(valueTotal).toLocaleString());
}

function updateLineChartDash(msa, type) {

    if (d3.select('.clicked')._groups[0][0] !== null) {
        d3.select('.clicked').attr('class', '')
            .attr('stroke', '#969696')
            .style('stroke-width', '1px');
    }

    if (type === 'case') {
        d3.select('#svg-LineChart-case').remove();
        if (msa !== 'Select MSA') {
            lineChartDash(store['case']['total_cases'],store['case']['new_cases'],  msa, d3.select('#cases-dashboard'), 'case');
        } else {
            lineChartDash(store['case']['total_cases'], store['case']['new_cases'], store.msa, d3.select('#cases-dashboard'), 'case');
        }
    } else {
        d3.select('#svg-LineChart-death').remove();
        if (msa !== 'Select MSA') {
            lineChartDash(store['death']['total_deaths'], store['death']['new_deaths'],  msa, d3.select('#deaths-dashboard'), 'death');
        } else {
            lineChartDash(store['death']['total_deaths'], store['death']['new_deaths'], store.msa, d3.select('#deaths-dashboard'), 'death');
        }
    }
}

function updateCaseDate(source) {
    const date = subtractDays(store.date, 90 - source.value);

    const dateMonth = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const dateDate = ((date.getDate()) < 10) ? '0' + date.getDate() : date.getDate();
    const dateString = date.getFullYear() + '-' + dateMonth + '-' + dateDate;

    store.caseDate = dateString;

    d3.select('#linechart-case__Date').text(dateToMonthDay(date));

    d3.selectAll('.circles_case')
        .attr('r', 0);

    d3.select('#case-daily-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        .attr('r', 3);

    d3.select('#case-total-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        .attr('r', 3);

    d3.select('#caseDaily').text(Math.round(store['case']['new_cases'].filter(d=>d.msas === store.msa)[0][dateString]).toLocaleString());
    d3.select('#caseTotal').text(Math.round(store['case']['total_cases'].filter(d=>d.msas === store.msa)[0][dateString]).toLocaleString());
    updateMap(dateString, 'case', store['caseMapType']);
}

function updateDeathDate(source) {
    const date = subtractDays(store.date, 90 - source.value);
    const dateString = dateToString(date);

    store.deathDate = dateString;

    d3.select('#linechart-death__Date').text(dateToMonthDay(date));

    d3.selectAll('.circles_death')
        .attr('r', 0);

    d3.select('#death-daily-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        .attr('r', 3);

    d3.select('#death-total-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        .attr('r', 3);

    d3.select('#deathDaily').text(Math.round(store['death']['new_deaths'].filter(d=>d.msas === store.msa)[0][dateString]).toLocaleString());
    d3.select('#deathTotal').text(Math.round(store['death']['total_deaths'].filter(d=>d.msas === store.msa)[0][dateString]).toLocaleString());

    updateMap(dateString, 'death', store['deathMapType']);
}

function dateToMonthDay(date){
    const monthToString = {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sept',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec'
    };
    return monthToString[date.getMonth()+1]+' '+date.getDate();
}

function dateToString(date){

    const dateMonth = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const dateDate = ((date.getDate()) < 10) ? '0' + date.getDate() : date.getDate();
    const dateString = date.getFullYear() + '-' + dateMonth + '-' + dateDate;

    return dateString;
}