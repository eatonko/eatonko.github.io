// Linechart Class for Proj1 vis
class BarChart {
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

        //key array to know the keys
        vis.keyArr = Object.keys(vis.data[0]);

        vis.xScale = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year)])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 366])
            .range([vis.height, 0])

        vis.barYScale = d3.scaleLinear()
            .domain([0, 366])
            .range([0 ,vis.height])

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
            .attr('height', vis.config.containerHeight)
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
        
        vis.yAxisText = vis.chart.append('text')
            .attr("x", vis.width/2)
            .attr("y", vis.height + vis.config.margin.bottom - 5)
            //.attr("transform", `rotate(90deg)`)
            .attr("text-anchor", "middle")
            .attr("class", "chart-axis")
            .text("Year");
        
        //Color Ordinal for the Lines
        vis.colorMap = ['#444443']

         // Empty tooltip group (hidden by default)
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

        //bisector
        vis.xValue = d => d.year;
        vis.bisectDate = d3.bisector(vis.xValue).left;
        //vis.yValue = d => d.max_aqi;
        // Set the scale input domains
        //vis.xScale.domain(d3.extent(vis.data, vis.xValue));

        //TODO: Fix the domain, make it react to the data
        //vis.yScale.domain([0, 300]);
    
        vis.renderVis();
    }
    renderVis(){
        let vis = this;
       
        let num_days = 0

        for(let i = 0; i < vis.data.length; i++){
            //for each data entry
                // Add rect
            num_days =  ((vis.data[i] % 4 == 0 ? 366 : 365))   
            vis.chart.append('rect')
            .data([vis.data[i]])
            .attr('class', vis.config.class)
            .attr('fill', vis.colorMap)
            .attr('x', d => vis.xScale(d.year) - 10)
            .attr('y', d => vis.height - vis.barYScale(num_days - d[vis.keyArr[1]]))
            .attr('width', d => 20 )
            .attr('height', d => vis.barYScale(num_days - d[vis.keyArr[1]]))
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
                    for(let i = 1; i < vis.keyArr.length; ++i){
                        toReturn += `<li>${vis.keyArr[i]}: ${d[vis.keyArr[i]]}</li>`;
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
        
        })
        
        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
        
    }
}

