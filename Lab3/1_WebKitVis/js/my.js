const height = 800;
const width = 800;

const dataPath = "../1_WebKitVis/data/webkit-dep.json"

const svg = d3.select('#my_svg')
    .attr('width', width)
    .attr('height', height);

// 添加一个背景矩形以显示svg覆盖的范围
svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', 'grey');

const graph_g = svg.append('g')
    .attr('id', 'graph_g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

const categories = ['HTMLElement','WebGL','SVG','CSS','Other'];
const group5color = {
    0: '#5974c9',
    1: '#95cf79',
    2: '#fccb5d',
    3: '#f06a6a',
    4: '#77c3e1'
}


const cate = svg.selectAll('.categories')
    .data(categories, d => d)
    .enter()
    .append('g')
    .attr('class','categories');

cate.append('rect')
    .attr('x', (d, i) => (80 + 150 * i))
    .attr('y', 40)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill',(d, i) => group5color[i]) ;

cate.append('text')
    .attr('x',(d, i) => (150 * i + 110))
    .attr('y',50)
    .text(d => d)


d3.json(dataPath)
    .then(function(graph) {
        const nodes = graph.nodes;
        const links = graph.links;

        const node_name2node_id = {};
        for (const [id, node] of Object.entries(nodes)) {
            node.color = group5color[node["category"]];
            node_name2node_id[node.name] = id;
            node.id = id;
        }

        for (const link of links) {
            link.id = link.source + '_' + link.target
        }

        const link = graph_g.append("g")
            .attr('id', 'links_g')
            .selectAll("line")
            .data(links)
            .enter().append('line')
            .attr('id', d => 'link_' + d.id)
            .attr('stroke', '#ccc');

        const node = graph_g.append("g")
            .attr('id', 'circles_g')
            .selectAll("circle")
            .data(nodes)
            .enter().append('circle')
            .attr('id', d => 'node_' + d.id)
            .attr("stroke", '#fff')
            .attr('fill', d => d.color)
            .attr("r", 5)
            .on("mouseover", function (d) {
                d3.selectAll("circle")
                    .attr("opacity", 0.5)
                d3.select(this)
                    .attr("r", 10)
                    .attr("opacity", 1.0)
                let xPosition = parseFloat(d3.select(this).attr("cx")) + width / 2 - 30;
                let yPosition = parseFloat(d3.select(this).attr("cy")) + height / 2 - 40;
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .select("#value")
                    .text(d.name)
                d3.select("#tooltip").classed("hidden", false)
            })
            .on("mouseout", function() {
                d3.selectAll("circle")
                    .attr("opacity", 1.0)
                d3.select(this)
                    .attr("r", 5)
                d3.select("#tooltip").classed("hidden", true)
            });
        // node.append('title')
        //     .text(d => d.name);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links))
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
    });