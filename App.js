const KEY = "G57MS3UNTVF82I7M"
var func;
var symbol;
var key;
var interval;
let data = []

class Stock {
    constructor(name, close, range, color) {
        this.name = name; 
        this.close = close; 
        this.range = range; 
        this.color = color;
    }
}

var watchlist = []

function intraday() {
    document.getElementById("INTRADAY").classList.add('selected');
    document.getElementById("DAILY").classList.remove('selected');
    document.getElementById("WEEKLY").classList.remove('selected');
    document.getElementById("MONTHLY").classList.remove('selected');
    func = "INTRADAY"
    key = "Time Series (5min)"
    interval = "interval=5min"
}

function daily() {
    document.getElementById("INTRADAY").classList.remove('selected');
    document.getElementById("DAILY").classList.add('selected');
    document.getElementById("WEEKLY").classList.remove('selected');
    document.getElementById("MONTHLY").classList.remove('selected');
    func = "DAILY"
    key = "Time Series (Daily)"
    interval = "outputsize=full"
}

function weekly() {
    document.getElementById("INTRADAY").classList.remove('selected');
    document.getElementById("DAILY").classList.remove('selected');
    document.getElementById("WEEKLY").classList.add('selected');
    document.getElementById("MONTHLY").classList.remove('selected');
    func = "WEEKLY"
    key = "Weekly Time Series"
    interval = "datatype=json"
}

function monthly() {
    document.getElementById("INTRADAY").classList.remove('selected');
    document.getElementById("DAILY").classList.remove('selected');
    document.getElementById("WEEKLY").classList.remove('selected');
    document.getElementById("MONTHLY").classList.add('selected');
    func = "MONTHLY"
    key = "Monthly Time Series"
    interval = "datatype=json"
}

async function load_data() {
    hide_data();
    symbol = document.getElementById('search').value;
    url = `https://www.alphavantage.co/query?function=TIME_SERIES_${func}&symbol=${symbol}&${interval}&apikey=${KEY}`
    response = await fetch(url)
    data = await response.json();
    data = data[key];
    if(data)
        get_data();
}

function hide_data() {
    document.getElementById('info_con').hidden = true;
}

function get_data() {
    let text = ``;
    var index = 0;
    var opening_data;
    var closing_data;
    var color = "white";
    for (let i in data) {
        index+=1
        if(index===6)
            break;
        if(index===1) {
            date = "Date";
            if(func=="INTRADAY")
                date = i.split(" ")[0];
            text += `<tr>
                        <th>${date}</th>
                        <th>Open</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Close</th>
                        <th>Volume</th>
                    </tr>`
            opening_data = parseFloat(data[i]["1. open"]);
            closing_data = parseFloat(data[i]["4. close"]);
            if(opening_data > closing_data)
                color = "red";
            if(opening_data < closing_data)
                color = "green";
        }
        time = i
        if(func=="INTRADAY")
            time = i.split(" ")[1];
        text += `<tr>
                    <td>${time}</td>
                    <td>${parseFloat(data[i]["1. open"])}</td>
                    <td>${parseFloat(data[i]["2. high"])}</td>
                    <td>${parseFloat(data[i]["3. low"])}</td>
                    <td>${parseFloat(data[i]["4. close"])}</td>
                    <td>${parseFloat(data[i]["5. volume"])}</td>
                </tr>`;
    }
    var found = false;
    for(var i=0;i<watchlist.length;i++) {
        if(watchlist[i].name==symbol.toUpperCase() && watchlist[i].range==func) {
            found = true;
        }
    }
    if(!found) {
        watchlist.unshift(new Stock(symbol.toUpperCase(), closing_data, func, color));
        if(watchlist.length===5)
            watchlist.pop();
        watchlist_data();
    }
    if(text===``) {
        document.getElementById('info_con').hidden = true;
    } else {
        document.getElementById('info').innerHTML = text;
        document.getElementById('info_con').hidden = false;
        document.getElementById('stocks').innerHTML = `
            <div style="width: 80px;">${symbol.toUpperCase()}</div> 
            <div class="status" style="background-color: ${color};">${closing_data}</div>
            <div class="range">${func}</div>
            <button class="close" onclick="hide_data()">X</button>
        `
    }
}

function watchlist_data() {
    text = ""
    for(var i=0;i<watchlist.length;i++) {
        var name = watchlist[i].name.toUpperCase();
        var range = watchlist[i].range;
        text += `
                <h1 class="stocks">
                    <div style="display: flex;" onclick="show_watchlist('${name}','${range}')">
                        <div style="width: 80px;">${name}</div> 
                        <div class="status" style="background-color: ${watchlist[i].color};">${watchlist[i].close}</div>
                        <div class="range">${range}</div>
                    </div>
                    <button class="close" onclick="remove_stock(${i})">X</button>
                </h1> 
        `
    }
    if(text != "") {
        document.getElementById('watchlist_con').hidden = false;
        document.getElementById('watchlist').innerHTML = text;
    } else {
        document.getElementById('watchlist_con').hidden = true;
    }
}

function remove_stock(index) {
    if (index >= 0 && index < watchlist.length) {
        watchlist.splice(index, 1);
    }
    watchlist_data();
}

async function show_watchlist(name, range) {
    hide_data();
    switch(range) { 
        case "INTRADAY":
            intraday();
            break;
        case "DAILY":
            daily();
            break;
        case "MONTHLY":
             monthly();
            break;
        case "WEEKLY":
            weekly();
            break;
    }
    symbol = name;
    url = `https://www.alphavantage.co/query?function=TIME_SERIES_${func}&symbol=${symbol}&${interval}&apikey=${KEY}`
    response = await fetch(url)
    data = await response.json();
    data = data[key];
    if(data)
        get_data();
}


