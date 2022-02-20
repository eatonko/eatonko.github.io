//Global Variables to use
var globalData;
let lineChart1a, lineChart2a, barCharta, pieAQIa, piePola;
let lineChart1b, lineChart2b, barChartb, pieAQIb, piePolb;
let currCounty1 = ["California", "San Francisco"]; //initial value for the current county
let currCounty2 = ["California", "San Francisco"]; //initial value for the current county
let currYear = 2021;

//for every update in a county, update the data
// (note: this means the initial value will not be read unless called)
function getCounty1(){
  var county1Element = document.getElementById("county1");
  return county1Element.value.split(',');
}

function getCounty2(){
  var county1Element = document.getElementById("county2");
  return county1Element.value.split(',');
}

//Update county functions
//get data, update it and re-render everything
function updateCounty1(updatedCounty1){
  console.log("updated 1!");

  //Clean up the data
  currCounty1 = updatedCounty1.split(',');

  let updatedCounty1Cleaned = getCleanCounty(globalData, currCounty1[0], currCounty1[1]); 

  lineChart1a.updateVis(aqiDataParse(updatedCounty1Cleaned));

  lineChart2a.updateVis(polutantDataParse(updatedCounty1Cleaned));

  barCharta.updateVis(aqiDaysParse(updatedCounty1Cleaned));

  pieAQIa.updateVis(aqiPercentageDataParse(updatedCounty1Cleaned, currYear));

  piePola.updateVis(polutantPercentageDataParse(updatedCounty1Cleaned, currYear));
}

//County 2
//Update county functions
//get data, update it and re-render everything
function updateCounty2(updatedCounty2){
  console.log("updated 2!");

  //Clean up the data
  currCounty2 = updatedCounty2.split(',');

  let updatedCounty2Cleaned = getCleanCounty(globalData, currCounty2[0], currCounty2[1]); 

  lineChart1b.updateVis(aqiDataParse(updatedCounty2Cleaned));

  lineChart2b.updateVis(polutantDataParse(updatedCounty2Cleaned));

  barChartb.updateVis(aqiDaysParse(updatedCounty2Cleaned));

  pieAQIb.updateVis(aqiPercentageDataParse(updatedCounty2Cleaned, currYear));

  piePolb.updateVis(polutantPercentageDataParse(updatedCounty2Cleaned, currYear));
}

//update year for all pie charts
function updateYear(newYear){
  currYear = newYear;

  //Update county
  let updatedCounty1Cleaned = getCleanCounty(globalData, currCounty1[0], currCounty1[1]); 
  let updatedCounty2Cleaned = getCleanCounty(globalData, currCounty2[0], currCounty2[1]); 

  //Update each pie chart vis
  pieAQIa.updateVis(aqiPercentageDataParse(updatedCounty1Cleaned, currYear));

  piePola.updateVis(polutantPercentageDataParse(updatedCounty1Cleaned, currYear));

  pieAQIb.updateVis(aqiPercentageDataParse(updatedCounty2Cleaned, currYear));

  piePolb.updateVis(polutantPercentageDataParse(updatedCounty2Cleaned, currYear));
}



d3.csv('data/aqidata.csv')
  .then(data => {
    console.log("Data loading complete.")
    //save data as a global, to use for later
    globalData = data;
    console.log(globalData)

    //Get first county data after data load
    var county1Array = getCounty1();
    //Parse out Hamilton County data
    let county1Data = getCleanCounty(data, county1Array[0], county1Array[1]); 
    
    //Left side elements
    lineChart1a = new LineChart({ parentElement: '#linechart1a', class:"1A", title:"Shift in AQI"}, aqiDataParse(county1Data));
    lineChart1a.updateVis()

    lineChart2a = new LineChart({ parentElement: '#linechart2a', class:"2A", title:"Major Pollutants by Days"}, polutantDataParse(county1Data));
    lineChart2a.updateVis()

    barCharta = new BarChart({ parentElement: '#barcharta', class:"BA", title:"Days w/out AQI"}, aqiDaysParse(county1Data));
    barCharta.updateVis()

    pieAQIa = new PieChart({ parentElement: '#pieAQIa', class:"P1A", title:"Type of AQI"}, aqiPercentageDataParse(county1Data, currYear));
    pieAQIa.updateVis()

    piePola = new PieChart({ parentElement: '#piePola', class:"P2A", title:"Type of Pollutant"}, polutantPercentageDataParse(county1Data, currYear));
    piePola.updateVis();

    //Right Side
    //Get first county data after data load
    var county2Array = getCounty2();
    //Parse out Hamilton County data
    county2Data = getCleanCounty(data, county2Array[0], county2Array[1]); 

    lineChart1b = new LineChart({ parentElement: '#linechart1b', class:"1B", title:"Shift in AQI"}, aqiDataParse(county2Data));
    lineChart1b.updateVis()

    lineChart2b = new LineChart({ parentElement: '#linechart2b', class:"2B", title:"Major Pollutants by Days"}, polutantDataParse(county2Data));
    lineChart2b.updateVis()

    barChartb = new BarChart({ parentElement: '#barchartb', class:"BB", title:"Days w/out AQI"}, aqiDaysParse(county2Data));
    barChartb.updateVis()

    pieAQIb = new PieChart({ parentElement: '#pieAQIb', class:"P1B", title:"Type of AQI"}, aqiPercentageDataParse(county2Data, currYear));
    pieAQIb.updateVis()

    piePolb = new PieChart({ parentElement: '#piePolb', class:"P2B", title:"Type of Pollutant"}, polutantPercentageDataParse(county2Data, currYear));
    piePolb.updateVis()
  })

  
          
function getCleanCounty(fullData, stateName, countyName){
  let cleanCounty = []
  fullData.forEach(d => {
    if(d.State == stateName && d.County == countyName){
      cleanCounty.push(d);
    }
  })
  return cleanCounty;
}

function aqiDataParse(toParse){
  let aqiData = []
  toParse.forEach(d => {
      aqiData.push({
          "year": parseInt(d["Year"]), 
          "Max AQI": parseInt(d["Max AQI"]),
          "90th Percentile AQI": parseInt(d["90th Percentile AQI"]),
          "Median AQI": parseInt(d["Median AQI"])
      })
  })
  return aqiData
}

function polutantDataParse(toParse){
  let polutantData = []
  toParse.forEach(d => {
    polutantData.push({
        "year": parseInt(d["Year"]), 
        "Days CO": parseInt(d["Days CO"]),
        "Days NO2": parseInt(d["Days NO2"]),
        "Days Ozone": parseInt(d["Days Ozone"]),
        "Days PM10": parseInt(d["Days PM10"]),
        "Days PM2.5": parseInt(d["Days PM2.5"]),
        "Days SO2": parseInt(d["Days SO2"])
      })
  })
  return polutantData
}


function aqiDaysParse(toParse){
  let aqiDays = []
  toParse.forEach(d => {
    aqiDays.push({
        "year": parseInt(d["Year"]), 
        "Days with AQI": parseInt(d["Days with AQI"])
      })
  })
  return aqiDays
}


function aqiPercentageDataParse(toParse, year){
  let polutantData = []
  toParse.forEach(d => {
    if(parseInt(d["Year"]) == year){
      polutantData.push({
          "Good Days": parseInt(d["Good Days"]),
          "Moderate Days": parseInt(d["Moderate Days"]),
          "Unhealthy for Sensitive Groups Days": parseInt(d["Unhealthy for Sensitive Groups Days"]),
          "Unhealthy Days": parseInt(d["Unhealthy Days"]),
          "Very Unhealthy Days": parseInt(d["Very Unhealthy Days"]),
          "Hazardous Days": parseInt(d["Hazardous Days"]),        
          "Days with AQI": parseInt(d["Days with AQI"]),
        })
    }
  })
  return polutantData
}

function polutantPercentageDataParse(toParse, year){
  let polutantData = []
  toParse.forEach(d => {
    if(d["Year"] == year){
      polutantData.push({
        "Days CO": parseInt(d["Days CO"]),
        "Days NO2": parseInt(d["Days NO2"]),
        "Days Ozone": parseInt(d["Days Ozone"]),
        "Days PM10": parseInt(d["Days PM10"]),
        "Days PM2.5": parseInt(d["Days PM2.5"]),
        "Days SO2": parseInt(d["Days SO2"]),   
        "Days with AQI": parseInt(d["Days with AQI"]),
      })
    }
    
  })
  return polutantData
}

function removeElementsByClass(className){
  const elements = document.getElementsByClassName(className);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}