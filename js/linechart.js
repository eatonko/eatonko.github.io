// Linechart Class for Proj1 vis
class LineChart {
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 25, right: 100, bottom: 50, left: 100},
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
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .nice();

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d3.format("d"));

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0)
            .tickPadding(10);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

         //Title element
         vis.title = vis.chart.append('text')
            .attr("x", vis.width/2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("class", "chart-title")
            .text(vis.config.title);
        //x and y axis titles
        vis.yAxisText = vis.chart.append('text')
            .attr("x", -vis.config.margin.left/2 - 15)
            .attr("y", vis.height/2)
            //.attr("transform", `rotate(90deg)`)
            .attr("text-anchor", "middle")
            .attr("class", "chart-axis")
            .text("# of Days");
        
        vis.xAxisText = vis.chart.append('text')
            .attr("x", vis.width/2)
            .attr("y", vis.height + vis.config.margin.bottom - 5)
            //.attr("transform", `rotate(90deg)`)
            .attr("text-anchor", "middle")
            .attr("class", "chart-axis")
            .text("Year")

        //Color Ordinal for the Lines
        vis.colorMap = d3.scaleOrdinal()
            .domain(Object.keys(vis.data[0]))
            .range(d3.schemeTableau10)

        vis.keyArr = Object.keys(vis.data[0]);
        vis.keyArr = vis.keyArr.slice(1);
        //legend
        vis.dots = vis.svg.selectAll("mydots")
        .data(vis.keyArr)
        .enter()
        .append("circle")
        .attr("cx", vis.width + vis.config.margin.right + 5)
        .attr("cy", (d, i) => 100 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 4)
            .style("fill",  d => vis.colorMap(d))
        
        // Add one dot in the legend for each name.
        vis.labels = vis.svg.selectAll("mylabels")
        .data(vis.keyArr)
        .enter()
        .append("text")
        .attr("x", vis.width + vis.config.margin.right + 20)
           .attr("y", (d, i) => 105 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
           .style("fill", d => vis.colorMap(d))
           .text(function(d){ return d.replace("Days", '')})
           .attr("text-anchor", "left")
           .style("alignment-baseline", "middle")
           .style("font-size", "80%")
           
        // // Empty tooltip group (hidden by default)
        vis.tooltip = vis.chart.append('g')
            .attr('class', 'tooltip')
            .style('display', 'none');

        vis.tooltip.append('text');

        //shadow highlight
        vis.highlight = vis.chart.append('rect')
            .attr('width', 2)
            .attr('height', vis.config.containerHeight)
            .attr('fill', 'gray')
            .attr('id', 'highlight')
            .attr('display', 'none')
            .attr('opacity', 0.4)
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
        
        vis.xValue = d => d.year;
        vis.yValue = d => d.max_aqi;

        //bisector
        vis.bisectDate = d3.bisector(vis.xValue).left;
        // Set the scale input domains
        vis.xScale.domain(d3.extent(vis.data, vis.xValue));

        vis.yScale.domain([0, 500]);
    
        vis.renderVis();
    }
    renderVis(){
        let vis = this;
        let keyArr = Object.keys(vis.data[0]);

        for(let i = 1; i < keyArr.length; i++){    
            // Add line path
            vis.chart.append('path')
            .data([vis.data])
            .attr('class', vis.config.class)
            .attr('d', d3.line()
                .x(d => vis.xScale(d.year))
                .y(d => vis.yScale(d[keyArr[i]])))
            .attr('stroke', (d) => vis.colorMap(keyArr[i]))
            .attr('fill', 'none')
            
        } 
        
        //Tracking mouse
        const trackingArea = vis.chart.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseenter', () => {
                vis.tooltip.style('display', 'block');
                d3.selectAll('#highlight').style('display', 'block');
            })
            .on('mouseleave', () => {
                d3.select('#tooltipBox').style('display', 'none');
                d3.selectAll('#highlight').style('display', 'none');
            })
            .on('mousemove', function(event) {
                const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
                const year = vis.xScale.invert(xPos);
                        // Find nearest data point
                const index = vis.bisectDate(vis.data, year, 1);
                const a = vis.data[index - 1];
                const b = vis.data[index];
                const d = b && (year - a.year > b.year - year) ? b : a;                

                let html = () => {
                    var toReturn = ``;
                    toReturn += `<div class="tooltip-title">${vis.config.title}</div>`;
                    for(let i = 1; i < keyArr.length; ++i){
                        toReturn += `<li class="list-ele">${keyArr[i]}: ${d[keyArr[i]]}</li>`;
                    }
                    
                                    // <div><i>${d.max_aqi}</i></div>
                                    // <ul>
                                    // <li>${d.max_aqi} km, ~${d.max_aqi} hours</li>
                                    // <li>${d.max_aqi}</li>
                                    // <li>${d.max_aqi}</li>
                                    // </ul>`
                    return toReturn
                }
                //Call the d3 in my html, update values in it
        d3.select("#tooltipBox")
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', (event.pageY  + 15) + 'px')
            .style('left', (event.pageX + 15) + 'px')
            .html(html);

        d3.selectAll('#highlight')
            .attr('transform', `translate(${xPos},${vis.config.margin.top - 50})`)

             

            // // Update tooltip
            // vis.tooltip.select('circle')
            //     .attr('transform', `translate(${vis.xScale(d.year)},${vis.yScale(d.max_aqi)})`);
            
            // vis.tooltip.select('text')
            //     .attr('transform', `translate(${vis.xScale(d.year)},${(vis.yScale(d.max_aqi) - 15)})`)
            //     .text(Math.round(d.max_aqi));
        })
        
        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}


