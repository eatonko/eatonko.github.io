// Pollutant Stacked Chart
class StackedPollutants {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 25, right: 20, bottom: 30, left: 50},
            displayType: 'absolute'
        }
        this.data = _data;
        this.initVis();
    }

    initVis(){
        let vis = this;

        //set container width and height
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        //set x and y scale for container
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        vis.colorScale = d3.scaleOrdinal()
            .range(['#6080b5', '#60a0b5', '#0080b5', '#5a9866', '#f7dc7a']);
        
        //Axes Initialization
        vis.xAxis = d3.axisBottom(vis.xScale)
        .tickFormat(d3.format("d")); // Remove thousand comma

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width)
            .tickPadding(10);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chartContainer = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.chart = vis.chartContainer.append('g');

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.stack = d3.stack()
            .keys([0,1,2,3,4]);

        vis.axisTitle = vis.chartContainer.append('text')
            .attr('class', 'axis-label')
            .attr('y', -18)
            .attr('x', -25)
            .attr('dy', '0.35em')
            .text('Stacked Pollutants');
    }

    updateVis() {
        let vis = this;

        //convert data to only necessary data points
        vis.groupedData = d3.groups(vis.data, d => parseInt(d.year));
        console.log(vis.groupedData)
        
        // put grouped data into the stack
        vis.stackedData = vis.stack(vis.groupedData)
        
    }

}

function pollutantParse(toParse){
    let parseData = []
    toParse.forEach(d => {
        parseData.push({
            "year": parseInt(d["Year"]), 
            "co": parseInt(d["Days CO"]),
            "no2": parseInt(d["Days NO2"]),
            "ozone": parseInt(d["Days Ozone"]),
            "pm10": parseInt(d["Days PM10"]),
            "pm25": parseInt(d["Days PM2.5"]),
            "s02": parseInt(d["Days SO2"])
        })
    })
    return parseData
}
