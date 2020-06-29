function getColor(){
    const colorCode = {
        new_cases: {
            breakPoint:[0.01, 5.01, 10.01, 25.01, 50.01, 100.01, 200.01, 500.01, 1500.01]
        },
        total_cases:{
            breakPoint:[100.01, 500.01, 1000.01, 5000.01, 10000.01, 20000.01, 50000.01, 100000.01]
        },
        new_deaths:{
            breakPoint:[0.01, 1.01, 2.01, 10.01, 50.01, 100.01]
        },
        total_deaths:{
            breakPoint:[1, 10.01, 20.01, 50.01, 100.01,500.01,1500.01,5000.01]
        }
    };

    Object.keys(colorCode).forEach(d=>{
        const range = d3.range(0.05,1,1/(colorCode[d].breakPoint.length+1)).reverse();
        const colors = range.map(d=>d3.interpolateInferno(d));
        colorCode[d].cScale = d3.scaleThreshold()
            .domain(colorCode[d].breakPoint)
            .range(colors);
    });

    return colorCode;
}

