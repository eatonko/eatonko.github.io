// Pie Chart class for Proj1
class PieChart {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 25, right: 50, bottom: 30, left: 50},
            class: _config.class || "none",
            title: _config.title
        }
        this.data = _data;
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        

        vis.xScale = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year)])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 366])
            .range([vis.height, 0]);

        //key array to know the keys
        vis.keyArr = Object.keys(vis.data[0]);

        // // Initialize axes
        // vis.xAxis = d3.axisBottom(vis.xScale)
        //     .ticks(6)
        //     .tickSizeOuter(0)
        //     .tickPadding(10)
        //     .tickFormat(d3.format("d"));

        // vis.yAxis = d3.axisLeft(vis.yScale)
        //     .ticks(6)
        //     .tickSizeOuter(0)
        //     .tickPadding(10);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${(vis.width/2)},${(vis.height/2)})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        //Title element
        vis.title = vis.chart.append('text')
            .attr("x", -vis.width/3)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "chart-title")
            .text(vis.config.title);
        
        //colormap
        vis.colorMap = d3.scaleOrdinal()
            .domain(Object.keys(vis.data[0]))
            .range(d3.schemeCategory10)
       
        // //Color Ordinal for the slices
        // vis.colorMap = d3.scaleOrdinal()
        //     .domain(Object.keys(vis.data[0]))
        //     .range(d3.schemeTableau10)
        
        //TODO
        
        //legend
        vis.dots = vis.svg.selectAll("mydots")
        .data(vis.keyArr)
        .enter()
        .append("circle")
            .attr("cx", "70%")
            .attr("cy", (d, i) => 100 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill",  d => vis.colorMap(d))

        // Add one dot in the legend for each name.
        vis.labels = vis.svg.selectAll("mylabels")
        .data(vis.keyArr)
        .enter()
        .append("text")
            .attr("x", "73%")
            .attr("y", (d, i) => 105 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", d => vis.colorMap(d))
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
        
        
        //Radius calculation
        vis.radius = Math.min(vis.width, vis.height)/3;
        //update vis
        vis.updateVis()
    }

    updateVis(newData = {}){
        let vis = this;
        
        if(Object.keys(newData).length !== 0){
            vis.data = newData
            //remove old lines
            removeElementsByClass(vis.config.class);
        }

        

        vis.percents = new Array(vis.keyArr.length).fill(0);

        //get total for each, including total days
        vis.data.forEach(d => {
            for(let i = 0; i < vis.keyArr.length; i++){
                vis.percents[i] += d[vis.keyArr[i]] 
            }            
        })

        for(let j = 0; j < vis.keyArr.length-1; j++){
            vis.percents[j] = 100 * (vis.percents[j] / vis.percents[vis.keyArr.length-1]);
        }
        //get rid of total
        vis.percents.pop();


         


        vis.renderVis();
    }
    renderVis(){
        let vis = this;

        vis.pie = d3.pie();
        vis.arc = d3.arc().innerRadius(0).outerRadius(vis.radius);
        vis.arcs = vis.chart.selectAll('arc')
            .data(vis.pie(vis.percents))
            .enter()
            .append("g")
            .attr('class', vis.config.class)

        vis.arcs.append("path")
            .attr("fill", d => vis.colorMap(vis.keyArr[d.index]))
            .attr('class', vis.config.class)
            .attr("d", vis.arc)

        


        // Tracking area for Tooltip
        const trackingArea = vis.chart.append('circle')
            .attr('r', vis.radius)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseenter', () => {
                d3.selectAll('#highlight').style('display', 'block');
            })
            .on('mouseleave', () => {
                d3.select('#tooltipBox').style('display', 'none');
                d3.selectAll('#highlight').style('display', 'none');
            })
            .on('mousemove', function(event) {
                //  const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
                //  const year = vis.xScale.invert(xPos);
                // //         // Find nearest data point
                //  const index = vis.bisectDate(vis.data, year, 1);
                // const a = vis.data[index - 1];
                // const b = vis.data[index];
                // const d = b && (year - a.year > b.year - year) ? b : a;                

                let html = () => {
                    var toReturn = ``;
                    toReturn += `<div class="tooltip-title">${vis.config.title}</div>`;
                    for(let i = 0; i < vis.keyArr.length-1; ++i){
                        toReturn += `<li>${vis.keyArr[i]}: ${vis.percents[i]}</li>`;
                    }
                    return toReturn
                }
                //Call the d3 in my html, update values in it
            d3.select("#tooltipBox")
                .style('display', 'block')
                .style('position', 'absolute')
                .style('top', (event.pageY  + 15) + 'px')
                .style('left', (event.pageX + 15) + 'px')
                .html(html);
        })
    }
}

