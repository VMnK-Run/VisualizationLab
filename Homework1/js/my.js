const width = 800;
const height = 400;
const margin = { left: 50, top: 30, right: 20, bottom: 20 };
const g_width = width - margin.left - margin.right;
const g_height = height - margin.top - margin.bottom;

const flag_width = 300;
const flag_height = 200;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', 'grey');

svg.append('rect')
    .attr("width", flag_width)
    .attr("height", flag_height)
    .attr('fill', 'red');

svg.append('g')
    .attr("transform", `translate(${flag_width / 6}, ${flag_height / 4})`)
    .append('path')
    .attr('d',d3.symbol().type(d3.symbolStar).size(800))
    .attr('fill','yellow');

svg.append('g')
    .attr("transform", `translate(${flag_width / 3}, ${flag_height / 10})`)
    .append('path')
    .attr('d',d3.symbol().type(d3.symbolStar).size(200))
    .attr('fill','yellow');

svg.append('g')
    .attr("transform", `translate(${flag_width / (30 / 12)}, ${flag_height / 5})`)
    .append('path')
    .attr('d',d3.symbol().type(d3.symbolStar).size(200))
    .attr('fill','yellow')

svg.append('g')
    .attr("transform", `translate(${flag_width / (30 / 12)}, ${flag_height / (20 / 7)})`)
    .append('path')
    .attr('d',d3.symbol().type(d3.symbolStar).size(200))
    .attr('fill','yellow')

svg.append('g')
    .attr("transform", `translate(${flag_width / 3}, ${flag_height / (20 / 9)})`)
    .append('path')
    .attr('d',d3.symbol().type(d3.symbolStar).size(200))
    .attr('fill','yellow')

const points0 = [[400, 120], [430, 100], [440, 130]];
svg.append("polygon")
    .attr("points", points0)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(159, 159, 161)");

const points1 = [[430, 100], [490, 120], [450, 160]];
svg.append("polygon")
    .attr("points", points1)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(35, 24, 22)");

const points2 = [[580, 160], [580, 30], [450, 160]];
svg.append("polygon")
    .attr("points", points2)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(159, 159, 161)");

const points3 = [[580, 160], [515, 225], [450, 160]];
svg.append("polygon")
    .attr("points", points3)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(35, 24, 22)");

const points4 = [[580, 160], [580, 30], [710, 30]];
svg.append("polygon")
    .attr("points", points4)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(35, 24, 22)");

const points5 = [[515, 225], [530, 210], [620, 250], [515, 250]];
svg.append("polygon")
    .attr("points", points5)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(35, 24, 22)");

const points6 = [[515, 95], [515, 15], [555, 55]];
svg.append("polygon")
    .attr("points", points6)
    .attr("stroke", "grey")
    .attr("stroke-width", "2")
    .attr("fill", "rgb(35, 24, 22)");

svg.append("circle")
    .attr("cx", 423)
    .attr("cy", 115)
    .attr("r", "5")
    .style("fill", "black")
    .style("stroke", "grey")
