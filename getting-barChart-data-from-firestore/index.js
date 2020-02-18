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

db.collection('dishes').get().then(res => {

    var data = [];
    res.docs.forEach(element => {
        data.push(element.data());
    });
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.orders)])
        .range([graphHeight, 0])

    const x = d3.scaleBand()
        .domain(data.map(item => item.name))
        .range([0, graphHeight])
        .paddingInner(0.2)
        .paddingOuter(0.2);


    // Join the data  to rect
    const rects = graph.selectAll('rect')
        .data(data)

    rects.attr('width', x.bandwidth)
        .attr('height', d => graphHeight - y(d.orders))
        .attr('fill', '#1a237e')
        .attr('x', (d) => x(d.name))
        .attr('y', d => y(d.orders))

    // Append enter selection to the DOM
    rects.enter()
        .append('rect')
        .attr('width', x.bandwidth)
        .attr('height', d => graphHeight - y(d.orders))
        .attr('fill', '#1a237e')
        .attr('x', (d) => x(d.name))
        .attr('y', d => y(d.orders))

    // Create and call the axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `${d} orders`);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end')
    .attr('font-size', 14)
    .attr('fill', '#f50057');

    yAxisGroup.selectAll('text')
        .attr('font-size', 14)
        .attr('fill', '#f50057')
})