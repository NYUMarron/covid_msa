function getColor() {
    const colorCode = {
        new_cases: {
            breakPoint: [0.01, 5.01, 10.01, 25.01, 50.01, 100.01, 200.01, 500.01, 1500.01],
            text:['0', '0.01 - 5', '5.01 - 10', '10.01 - 25', '25.01-50', '50.01-100', '100.01-200', '200.01-500', '500.01-1,500', '1,500+']
        },
        total_cases: {
            breakPoint: [100.01, 501, 1001, 5001, 10001, 20001, 50001, 100001],
            text: ['0-100', '101-500', '501-1,000', '1,001-5,000', '5,001-10,000', '10,001-20,000', '20,001-500,00', '50,001-100,000', '100,000+'],
        },
        new_deaths: {
            breakPoint: [0.01, 1.01, 2.01, 10.01, 50.01, 100.01],
            text: ['0.0', '0.01-1', '1.01-2', '2.01-10', '10.01-50', '50.01-100', '100+']
        },
        total_deaths: {
            breakPoint: [1, 11, 21, 51, 101, 501, 1501, 5001],
            text: ['0', '1-10', '11-20', '21-50', '51-100', '101-500', '501-1,500', '1,501-5,000', '5,000+']
        }
    };

    Object.keys(colorCode).forEach(d => {
        const range = d3.range(0.05, 1, 1 / (colorCode[d].breakPoint.length + 1)).reverse();
        const colors = range.map(d => d3.interpolateInferno(d));
        colorCode[d].colorArray = colors;
        colorCode[d].cScale = d3.scaleThreshold()
            .domain(colorCode[d].breakPoint)
            .range(colors);
    });

    return colorCode;
}

