function dropdownMSA(data,menu){
    menu.append('option')
        .text('New York-Newark-Jersey City, NY-NJ-PA')
        .attr('value','New York-Newark-Jersey City, NY-NJ-PA');

    const msaArray = data.map(d=>d['msas']);
    for(let i=0; i<msaArray.length;i++){
        menu.append('option')
            .text(msaArray[i])
            .attr('value',msaArray[i]);    }
}

function expandContents(node){
    if(node.nextElementSibling.classList[1]==='hidden'){
        node.nextElementSibling.classList.remove('hidden');
        node.nextElementSibling.classList.add('activate');
        node.firstElementChild.querySelector('h3').classList.add('section__title-active');
        node.lastElementChild.querySelector('p').innerText = 'Click to collapse ▲';
    }
    else{
        node.nextElementSibling.classList.remove('activate');
        node.nextElementSibling.classList.add('hidden');
        node.firstElementChild.querySelector('h3').classList.remove('section__title-active');
        node.lastElementChild.querySelector('p').innerText = 'Click to expand ▼';
    }
}
