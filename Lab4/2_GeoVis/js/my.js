const height = 800;
const width = 650;

const bar_height = 150;
const bar_width = 550;
const margin_left = 50;
const text_height = 50;

const geojsonPath = "../2_GeoVis/data/YELL.geojson";
const dataPath = "../2_GeoVis/data/all.csv";

const svg = d3.select('#my_svg')
    .attr('width', width)
    .attr('height', height);

// 添加一个背景矩形以显示svg覆盖的范围
svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', 'grey');

const projection = d3.geoMercator().center([-110.15, 44.75]).scale(26000); // 地理投影
const path = d3.geoPath().projection(projection); // 线段生成器
const hexbin = d3.hexbin()
    .x(d => d.x).y(d => d.y)
    .extent([0, 0], [width, height]).radius(6); // hexbin生成器

Promise.all([
    d3.json(geojsonPath),
    d3.csv(dataPath)
]).then((data)=>{

    let geojson = data[0];
    let dots = data[1];

    dots.forEach(d => {
        let coordinate = projection([d.lon, d.lat]);
        d.x = coordinate[0];
        d.y = coordinate[1];
    })
    let hex_data = hexbin(dots);
    let pudCount = arr => d3.set(arr.map(d => d['owner_date'])).size();
    let color = d3.scaleSequential([0, d3.max(hex_data, d => Math.sqrt(pudCount(d)))], d3.interpolateReds);

    let year_nest = d3.nest()
        .key(d => d.year)
        .rollup(v => {
            return {
                year: v[0].year,
                pud: pudCount(v)
            }
        })
        .map(dots)
        .values()

    let xScale = d3.scaleBand()
        .domain(year_nest.map(d => d.year))
        .range([0, bar_width]);
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(year_nest.map(d => d.pud))])
        .range([0, bar_height - text_height]);

    const bars = svg.selectAll('.bar')
        .data(year_nest, d => d.year)
        .enter()
        .append('g')
        .attr('transform', `translate(${margin_left},${height - bar_height})`)
        .attr('class', 'bar');

    bars.append('rect')
        .attr('class', 'Histogram')
        .attr('x', d => xScale(d.year))
        .attr('y', d => bar_height - yScale(d.pud) - text_height)
        .attr('width', bar_width / year_nest.length / 1.2)
        .attr('height', d => yScale(d.pud))
        .attr('d', d => d.year)
        .attr('fill', 'rgb(70, 130, 179)')
        .attr('opacity', '0.5')

    bars.append('text')
        .attr('x', d => xScale(d.year))
        .attr('y', bar_height - text_height / 2)
        .text(d => d.year)

    svg.append("path")
        .attr('d', path(geojson))
        .attr('fill', '#a6cee3')
        .attr('opacity', 0.3)
        .attr('stroke', 'black');

    const brush = d3.brushX()
        .extent([[0, 0], [bar_width, bar_height - text_height]])
        .on("start brush end", brushed);

    function brushed() {
        const selection = d3.event.selection;
        if (selection === null) {
            d3.selectAll(".hex")
                .attr("fill", "none")
                .attr("stroke", "none")
            d3.selectAll(".Histogram").style("opacity", 0.5)
        } else {
            // 选中范围的年份
            const selected = xScale
                .domain()
                .filter(d => (selection[0] - bar_width / year_nest.length / 12 <= xScale(d)
                    && xScale(d) <= selection[1]));
            d3.selectAll(".Histogram")
                .style("opacity", d => selected.includes(d.year) ? 1 : 0.5);
            let new_dots = dots.filter(d => selected.includes(d.year));
            let new_data = hexbin(new_dots);
            svg.selectAll(".hex")
                .data(new_data).join("path")
                .attr("class", "hex")
                .attr("transform", d => `translate(${d.x},${d.y})`)
                .attr("d", d => hexbin.hexagon(hexbin.radius()))
                .attr("fill", d => color(Math.sqrt(pudCount(d))))
                .attr("stroke", "#a6cee3")
                .append("title")
                .text(d => `${pudCount(d)} PUD`)
                .exit()
                .remove();
        }
    }

    bars.append('g')
        .call(brush);

});

