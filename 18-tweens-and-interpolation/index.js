const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600);

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const grapWidth = (600 - margin.left) - margin.right;
const graphHeight = (600 - margin.top) - margin.bottom;

const graph = svg.append('g')
    .attr('width', grapWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph.append('g')
    .attr('transform', `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append('g');

// scales
const y = d3.scaleLinear()
    .range([graphHeight, 0])

const x = d3.scaleBand()
    .range([0, graphHeight])
    .paddingInner(0.2)
    .paddingOuter(0.2);

// Create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => `${d} orders`);

// transition 
const transit = d3.transition().duration(1500);

// Update function (update data to realtime)
const update = data => {

    //updating scales (x, y)
    y.domain([0, d3.max(data, d => d.orders)])
    x.domain(data.map(item => item.name))

    // Join the data  to rects
    const rects = graph.selectAll('rect')
        .data(data)

    // Remove exit selection
    rects.exit().remove();
    
    // Append enter selection to the DOM and update new shapes to the DOM when data changes after merge
    rects.enter()
        .append('rect')
        .attr('height', 0)
        .attr('y', graphHeight)
        .merge(rects)
        .attr('width', 0)
        .attr('fill', '#1a237e')
        .attr('x', (d) => x(d.name))
        .transition(transit)
        .attrTween('width', widthTween)
        .attr('height', d => graphHeight - y(d.orders))
        .attr('y', d => y(d.orders))

    // Call the axes to update ticks
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // formatting x and y axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
        .attr('font-size', 14)
        .attr('fill', '#f50057');

    yAxisGroup.selectAll('text')
        .attr('font-size', 14)
        .attr('fill', '#f50057')
}

var data = [];

db.collection('dishes').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id };
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;

            case 'modified':
                const index = data.findIndex(item => item.id === doc.id);
                data[index] = doc;
                break;

            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;

            default:
                break;
        }
    })

    update(data);
})

const widthTween = d => {
    let i = d3.interpolate(0, x.bandwidth())
    return function(t){
        return i(t); // this is nothing but a* (1-t) + b *t; 
    }
}

