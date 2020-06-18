// this is an empty object. Datasets will be stored in here.
const store = {};

// this is for line charts in the project description
Promise.all([
    d3.csv('data/USA_MSA_aggregated_case.csv', d3.autoType),
    d3.csv('data/USA_MSA_aggregated_death.csv', d3.autoType)
]).then(([cases, deaths]) => {
    lineChart(cases, d3.select('#MSA__chart-case'), 'case', '2020-03-01', '2020-05-14');
    lineChart(deaths, d3.select('#MSA__chart-death'), 'death', '2020-03-01', '2020-05-14');
});


// this is for line charts in dashboard part
Promise.all([
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/all_msas_cases.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/all_msas_deaths.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/7day_avg_cases.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/7day_avg_deaths.csv', d3.autoType),
    d3.json('data/map/state_simplified.geojson'),
    d3.json('data/map/msa_simplified_filtered.geojson')
]).then(([cases, deaths, casesDaily, deathsDaily, geoState, geoMSA]) => {
    store['case'] = {};
    store['case']['new_cases']= casesDaily;
    store['case']['total_cases'] = cases;
    store['death'] = {};
    store['death']['new_deaths'] = deathsDaily;
    store['death']['total_deaths'] = deaths;
    dropdownMSA(cases, d3.selectAll('.menu__MSA-select'));
    const msa = 'New York-Newark-Jersey City, NY-NJ-PA';
    lineChartDash(cases, casesDaily,msa, d3.select('#cases-dashboard'), 'case');
    lineChartDash(deaths, deathsDaily,msa, d3.select('#deaths-dashboard'), 'death');
    map(casesDaily, geoState, geoMSA, d3.select('#map_case'), 'case');
    map(deathsDaily, geoState, geoMSA, d3.select('#map_death'), 'death');
}).then(() => dropdownMSA_download(store['case']['total_cases'], d3.select('#checkboxes')));
