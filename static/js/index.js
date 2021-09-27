const button = document.getElementById('btnFunc');
const currenciesDIV = document.getElementById('currenciesDIV');

button.addEventListener('click', ()=>{
    const XHR = new XMLHttpRequest();
    console.log('Exchange rates updated');
    XHR.open('GET', '/bot/update');
    XHR.send(null);
});

const loadJSON = new Promise((resolveFunc, rejectFunc)=>{
    const xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/json");
    // 1. replace './data.json' with the local path of your file
    xObj.open('GET', 'data/currency.json', true);
    xObj.onreadystatechange = () => {
        if (xObj.readyState === 4 && xObj.status === 200) {
            // 2. call your callback function

            resolveFunc(xObj.responseText);
        }
    };
    xObj.send(null);
  });

function returnJSON(string){
    var json_obj = JSON.parse(string);
    
    return json_obj;
}

 


loadJSON.then((obj)=>{
    let currencies = returnJSON(obj);
    console.log(currencies['usd']);
    for(let i in currencies['usd']){
        let currency = i;
        let value = currencies['usd'][i];
        createParagraph(currenciesDIV, currency, currency + ' ' + value);
    }
});

function createParagraph(parentDIV, paragraphName, paragraphValue){
    let div = document.createElement('div');
    let paragraph = document.createElement('p');
    let value = document.createTextNode(paragraphValue);
    paragraph.appendChild(value);
    div.className = paragraphName;
    div.appendChild(paragraph);
    parentDIV.appendChild(div);
}