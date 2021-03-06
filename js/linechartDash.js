let pasthoveredDate;

function lineChartDash(data, dataDaily, msa, div, type) {

  // store msa value that user selected
  store.msa = msa;

  // filter dataset by selected msa area
  const dataFiltered = data.filter(d => d['msas'] === msa)[0];
  const dataFilteredDaily = dataDaily.filter(d => d['msas'] === msa)[0];

  // transform the dataset for d3 visualization
  let dataTransformed = caseDataPrep(dataFiltered, '%Y-%m-%d');
  let dataTransformedDaily = caseDataPrep(dataFilteredDaily, '%Y-%m-%d');

  const timeEndDaily = d3.max(dataTransformedDaily.map(d => d.date));
  const timeEndTotal = d3.max(dataTransformed.map(d => d.date));
  const timeEnd = d3.min([timeEndDaily, timeEndTotal]);
  const timeStart = subtractDays(timeEnd, 90);

  dataTransformed = dataTransformed.filter(d => d.date <= timeEnd);
  dataTransformed = dataTransformed.filter(d => d.date >= timeStart);
  dataTransformedDaily = dataTransformedDaily.filter(d => d.date <= timeEnd);
  dataTransformedDaily = dataTransformedDaily.filter(d => d.date >= timeStart);

  store.date = timeEnd;
  d3.select('#date_start_' + type).html(dateToMonthDay(timeStart));
  d3.select('#date_end_' + type).html(dateToMonthDay(timeEnd));

  // this is for getting dates with slider
  const date = subtractDays(timeEnd, 90 - document.getElementById(`${type}_slider`).value);

  // calculate maximum of cases or deaths and date
  let maxCase = d3.max(dataTransformed.map(d => d.cases));
  let maxCaseDaily = d3.max(dataTransformedDaily.map(d => d.cases));
  const maxDate = dataTransformedDaily.filter(d => d.cases === maxCaseDaily)[0]['date'];

  // set the margin of the visualization
  const margin = {top: 30, right: 80, bottom: 30, left: 80};
  const visWidth = 640 - margin.left - margin.right;
  const visHeight = 300 - margin.top - margin.bottom;

  // create svg tag in the div (#cases) tag
  const svg = div.append('svg')
    .attr('id', 'svg-LineChart-' + type)
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${visWidth + margin.left + margin.right} ${visHeight + margin.top + margin.bottom}`);

  // create container (g tag) that would contain a linechart, grid, and axises
  const container = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
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
    .attr('id', d => type + '-daily-' + dateToString(d.date))
    .attr('fill', '#EF5350')
    .attr('r', 0);

  circlesDaily.select('#' + type + '-daily-' + dateToString(date))
    .transition()
    .attr('r', 4);

  const circlesTotal = container.append('g')
    .attr('class', 'pointsTotal');

  circlesTotal.selectAll('circle')
    .data(dataTransformed)
    .join('circle')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.cases))
    .attr('class', 'circles_' + type)
    .attr('id', d => type + '-total-' + dateToString(d.date))
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#EF7373')
    .attr('r', 0);

  circlesTotal.select('#' + type + '-total-' + dateToString(date))
    .transition()
    .attr('r', 4);

  const value = dataTransformedDaily.filter(d => d.date.getTime() === date.getTime())[0]['cases'];
  const valueTotal = dataTransformed.filter(d => d.date.getTime() === date.getTime())[0]['cases'];
  d3.select(`#${type}New`).text(Math.round(value).toLocaleString());
  d3.select(`#${type}Total`).text(Math.round(valueTotal).toLocaleString());

  updateTitle(msa, type, dateToMonthDay(date) + ', ' + date.getFullYear());
  createLegend(lineColor, type);
}

function caseAxisDash(container, xScale, yScale, yScaleDaily, xAxis, yAxisTotal, yAxisDaily, timeEnd, visWidth, visHeight) {
  const fontSize = 11 * (640 / parseInt(d3.select('#svg-LineChart-case').style('width')));

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

  grid.append('g')
    .attr('class', 'sub-grid-x')
    .attr('transform', 'translate(0,' + visHeight + ')')
    .call(make_x_gridlines()
      .tickSize(-visHeight)
      .tickFormat(''));

  grid.append('g')
    .attr('class', 'sub-grid-y')
    .call(make_y_gridlines()
      .tickSize(-visWidth)
      .tickFormat('')
    );

  grid.selectAll('.sub-grid-x').selectAll('line')
    .attr('stroke', '#BBBBBB')
    .style('stroke-dasharray', '3 3');

  grid.selectAll('.sub-grid-y').selectAll('line')
    .attr('stroke', '#BBBBBB')
    .style('stroke-dasharray', '3 1');

  grid.selectAll('text').style('font-size',fontSize);
  grid.selectAll('.domain').remove();
}

function dateToString(date) {
  return monthToString[(date.getMonth() + 1)] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

function createLegend(lineColor, type) {
  const legendNew = d3.select('#legend-new-'+type);
  legendNew.html('');
  const legendTotal = d3.select('#legend-total-'+type);
  legendTotal.html('');

  legendNew.append('svg')
    .attr('width',30)
    .attr('height',12)
    .append('line')
    .attr('x1', 0)
    .attr('x2', 30)
    .attr('y1', 7)
    .attr('y2', 7)
    .attr('stroke', lineColor[type])
    .style('stroke-width', '2px');

    legendNew.append('span')
    .text('New '+type);

    legendTotal.append('svg')
      .attr('width',30)
      .attr('height',12)
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 7)
      .attr('y2', 7)
      .attr('stroke', lineColor[type])
    .style('stroke-width', '2px')
    .style('stroke-dasharray', '4,2')
    .style('stroke-opacity', '0.5');

    legendTotal.append('span')
      .text('Total '+type);
}

function updateTitle(msa, type, date) {

  d3.select('#Dashboard__chart-date-' + type)
    .text(date);

  d3.select('#Dashboard__chart-MSA-' + type)
    .text(msa);

  d3.select('#Dashboard__chart-population-' + type)
    .text(store.population.filter(d => d.MSA == msa)[0]['Population']);

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
      lineChartDash(store['case']['total_cases'], store['case']['new_cases'], msa, d3.select('#cases-dashboard'), 'case');
    } else {
      lineChartDash(store['case']['total_cases'], store['case']['new_cases'], store.msa, d3.select('#cases-dashboard'), 'case');
    }
  } else {
    d3.select('#svg-LineChart-death').remove();
    if (msa !== 'Select MSA') {
      lineChartDash(store['death']['total_deaths'], store['death']['new_deaths'], msa, d3.select('#deaths-dashboard'), 'death');
    } else {
      lineChartDash(store['death']['total_deaths'], store['death']['new_deaths'], store.msa, d3.select('#deaths-dashboard'), 'death');
    }
  }
}

function updateDate(source, type) {
  const date = subtractDays(store.date, 90 - source.value);

  const dateMonth = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const dateDate = ((date.getDate()) < 10) ? '0' + date.getDate() : date.getDate();
  const dateString = date.getFullYear() + '-' + dateMonth + '-' + dateDate;

  store[type + 'Date'] = dateString;

  d3.select('#Dashboard__chart-date-' + type).text(dateToMonthDay(date) + ', ' + date.getFullYear());

  d3.selectAll('.circles_' + type)
    .attr('r', 0);

  d3.select(`#${type}-daily-` + dateToString(date))
    .attr('r', 4);

  d3.select(`#${type}-total-` + dateToString(date))
    .attr('r', 4);

  d3.select(`#${type}New`).text(Math.round(store[type][`new_${type}s`].filter(d => d.msas === store.msa)[0][dateString]).toLocaleString());
  d3.select(`#${type}Total`).text(Math.round(store[type][`total_${type}s`].filter(d => d.msas === store.msa)[0][dateString]).toLocaleString());
  updateMap(dateString, type, store[type + 'MapType']);
}

function dateToMonthDay(date) {
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
  return monthToString[date.getMonth() + 1] + ' ' + date.getDate();
}

function dateToString(date) {

  const dateMonth = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const dateDate = ((date.getDate()) < 10) ? '0' + date.getDate() : date.getDate();
  const dateString = date.getFullYear() + '-' + dateMonth + '-' + dateDate;

  return dateString;
}