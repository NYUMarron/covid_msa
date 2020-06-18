function typeBtnClick(source){
    source.classList.add("download_type_btn-clicked");
    if(source.textContent==='Case'){
        source.nextElementSibling.classList.remove("download_type_btn-clicked");
    }
    else{
        source.previousElementSibling.classList.remove("download_type_btn-clicked");
    }
}

function dropdownMSA_download(data, menu) {
    const msaArray = data.map(d => d['msas']);
    menu.append('label')
        .attr('for', 'selectAll')
        .html(`<input type="checkbox" onclick="checkAll(this)" /> Select All`);
    for (let i = 0; i < msaArray.length; i++) {
        menu.append('label')
            .attr('for', msaArray[i])
            .html(`<input type="checkbox" onclick="dataExtract()" class="download__MSA-checkbox" name="MSA_check" id=${msaArray[i].replace(/\s/g, '').replace(/\./g, '')} /> ${msaArray[i]}`);
    }
    downloadDateSetting(store.date);
}

function downloadDateSetting(date) {
    const dateMonth = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const dateDate = ((date.getDate()) < 10) ? '0' + date.getDate() : date.getDate();
    const dateString = date.getFullYear() + '-' + dateMonth + '-' + dateDate;
    document.getElementById('download__time-end').value = dateString;
}

function checkAll(source) {
    let checkboxes = document.getElementsByName('MSA_check');
    for (let i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
}

function dataExtract() {
    const timeStart = document.getElementById('download__time-start').value;
    const timeEnd = document.getElementById('download__time-end').value;
    const dataType = document.getElementsByClassName("download_type_btn-clicked")[0].textContent;
    const checkboxes = document.getElementsByClassName('download__MSA-checkbox');
    let MSAArray = [];
    for (let i = 0, n = checkboxes.length; i < n; i++) {
        if (checkboxes[i].checked) {
            MSAArray.push(checkboxes[i].id);
        }
    }
    let dataFiltered;
    if (dataType === 'Case') {
        dataFiltered = store.case.total_cases.filter(d => MSAArray.includes(d.msas.replace(/\s/g, '').replace(/\./g, '')));
    } else {
        dataFiltered = store.death.total_deaths.filter(d => MSAArray.includes(d.msas.replace(/\s/g, '').replace(/\./g, '')));
    }
    let keyLength = Object.keys(dataFiltered[0]).length;
    let dateArray = Object.keys(dataFiltered[0]).slice(1, keyLength)
        .filter(d => (d3.timeParse('%Y-%m-%d')(timeStart) <= d3.timeParse('%Y-%m-%d')(d)) & (d3.timeParse('%Y-%m-%d')(timeEnd) >= d3.timeParse('%Y-%m-%d')(d)));

    dataFiltered = dataFiltered.map(function (d) {
        let obj = {};
        obj['msas'] = d['msas'];
        for (let i = 0; i < dateArray.length; i++) {
            obj[dateArray[i]] = d[dateArray[i]];
        }
        return obj;
    });


    let csv = Object.keys(dataFiltered[0]).join(',') + '\n';
    const arr_length = Object.keys(dataFiltered[0]).length;
    for (let i = 0; i < dataFiltered.length; i++) {
        csv += '"' + Object.values(dataFiltered[i])[0] + '"' + ',';
        csv += Object.values(dataFiltered[i]).slice(1, arr_length).join(',');
        csv += '\n';
    }
    store.csv = csv;
}

function download_csv() {
    dataExtract();
    let hiddenElement = document.createElement('a');
    const dataType =  document.getElementsByClassName("download_type_btn-clicked")[0].textContent;
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(store.csv);
    hiddenElement.target = '_blank';
    if (dataType === 'Case') {
        hiddenElement.download = 'covid19_case_MSA.csv';
    } else {
        hiddenElement.download = 'covid19_death_MSA.csv';
    }
    hiddenElement.click();
}

let expanded = false;

function showCheckboxes() {
    const checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
    } else {
        checkboxes.style.display = "none";
        expanded = false;
    }
}