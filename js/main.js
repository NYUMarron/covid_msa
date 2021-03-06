// this is an empty object. Datasets will be stored in here.
const store = {};

// this is for line charts in the project description
Promise.all([
    d3.csv('data/USA_MSA_aggregated_case.csv', d3.autoType),
    d3.csv('data/USA_MSA_aggregated_death.csv', d3.autoType)
]).then(([cases, deaths]) => {
    lineChart(cases, d3.select('#MSA__chart-case'), 'case');
    lineChart(deaths, d3.select('#MSA__chart-death'), 'death');
});


// this is for line charts in dashboard part
Promise.all([
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/all_msas_cases.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/all_msas_deaths.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/7day_avg_cases.csv', d3.autoType),
    d3.csv('https://raw.githubusercontent.com/NYUMarron/covid_msa/master/data/7day_avg_deaths.csv', d3.autoType),
    d3.csv('data/msa_population.csv',d3.autoType),
    d3.json('data/map/state_simplified.geojson'),
    d3.json('data/map/MSA_simplified_wo_water.geojson')
]).then(([cases, deaths, casesDaily, deathsDaily, population, geoState, geoMSA]) => {
    store['case'] = {};
    store['case']['new_cases'] = casesDaily;
    store['case']['total_cases'] = cases;
    store['death'] = {};
    store['death']['new_deaths'] = deathsDaily;
    store['death']['total_deaths'] = deaths;
    store['population'] = population;
    dropdownMSA(cases, d3.selectAll('.menu__MSA-select'));
    const msa = 'New York-Newark-Jersey City, NY-NJ-PA';
    lineChartDash(cases, casesDaily, msa, d3.select('#cases-dashboard'), 'case');
    lineChartDash(deaths, deathsDaily, msa, d3.select('#deaths-dashboard'), 'death');
    store.cScaleMap = getColor();
    map(casesDaily, geoState, geoMSA, d3.select('#map_case'), 'case');
    map(deathsDaily, geoState, geoMSA, d3.select('#map_death'), 'death');
}).then(() => {
    dropdownMSA_download(store['case']['total_cases'], d3.select('#checkboxes'));

    // this function is for responsive text size
    d3.select(window).on("resize", function() {
        const newWidth = d3.select("#svg-LineChart-case").style("width");
        const newFontSize = 11 * (640 / parseInt(newWidth));

        d3.selectAll(".tick").select("text")
          .style("font-size", newFontSize)
    });
});
