const margin = ({top:20, right:20, bottom:50, left:50})
const height = 700 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const dataPath = "../3_CountryVis/data/countries.csv"

const regionColors = {
    "Middle East and Africa": "#596F7E",
    "Americas": "#168B98",
    "Asia": "#ED5B67",
    "Oceania": "#fd8f24",
    "Europe": "#919c4c"
}

d3.csv(dataPath, d3.autoType).then(function(rawDatas) {

    function getData() {
        let data = rawDatas.filter(obj => {
            return obj.year === 2008
        }).map(obj => {
            return {
                country: obj["countries"],
                population: obj["population"],
                region: obj["region_simple"],
                gdp: obj["gdp_ppp_cap"] * obj["population"]
            }});
        for (let i = 2009; i <= 2016; i++) {
            let year_data = rawDatas.filter(obj => {
                return obj.year === i
            });
            for (let j = 0; j < year_data.length; j++) {
                for (let k = 0; k < data.length; k++) {
                    if(data[k].country === year_data[j]["countries"]) {
                        data[k].population += year_data[j]["population"]
                        data[k].gdp += year_data[j]["gdp_ppp_cap"] * year_data[j]["population"];
                        break;
                    }
                }
            }
        }
        return data;
    }

    // 设置颜色层级
    function colorHierarchy(hierarchy) {
        if(hierarchy.depth === 0) {
            hierarchy.color = "black";
        } else if(hierarchy.depth === 1) {
            hierarchy.color = regionColors[hierarchy.data.key];
        } else {
            hierarchy.color = hierarchy.parent.color;
        }
        if(hierarchy.children) {
            hierarchy.children.forEach(child => {
                colorHierarchy(child)});
        }
    }

    function render(cate, data) {
        let maxNum = 1000000000
        if(cate === "population") {
            maxNum = 1000000000;
        } else if (cate === "gdp") {
            maxNum = 10000000000000;
        }
        // 按区域分类
        let data_nest = d3.nest()
            .key(d => d.region)
            .entries(data)

        let data_hierarchy = d3.hierarchy({key: "data_nest", values: data_nest}, d => d.values)
            .sum(d => cate === "population" ? d.population : d.gdp)

        // console.log(data_hierarchy)
        let svg;
        if(cate === "population") {
            svg = d3.select("#population_svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
        } else if(cate === "gdp") {
            svg = d3.select("#gdp_svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
        }

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "#f5f5f2")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        let voronoi = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
        let name_labels = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
        let num_labels = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
        const voronoiTreeMap = d3.voronoiTreemap()
            .clip(d3.range(100).map(i => [
                (width * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2,
                (height * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2
            ]))

        voronoiTreeMap(data_hierarchy)
        colorHierarchy(data_hierarchy)

        let allNodes = data_hierarchy.descendants()
            .sort((a, b) => b.depth > a.depth)
            .map((d, i) => Object.assign({}, d, {id: i}))
        // console.log(allNodes)

        let hoveredShape = null;

        name_labels.selectAll('text')
            .data(allNodes.filter(d => d.depth === 2 ))
            .enter()
            .append('text')
            .attr('class', d => `label_${d.id}`)
            .attr('text-anchor', 'middle')
            .attr("transform", d => "translate("+[d.polygon.site.x, d.polygon.site.y+6]+")")
            .text(d => d.data.key || d.data.country)
            .attr('opacity', function(d) {
                if(d.data.key === hoveredShape){
                    return 1;
                } else if((cate === "population" ? d.data.population : d.data.gdp) > maxNum) {
                    return 1;
                } else {
                return 0;
                }
            })
            .attr('cursor', 'default')
            .attr('pointer-events', 'none')
            .attr('fill', 'black')
            .style('font-family', 'Montserrat');

        num_labels.selectAll('text')
            .data(allNodes.filter(d => d.depth === 2 ))
            .enter()
            .append('text')
            .attr('class', d => `label_${d.id}`)
            .attr('text-anchor', 'middle')
            .attr("transform", d => "translate("+[d.polygon.site.x, d.polygon.site.y+25]+")")
            .text(d => d3.format(",.0f")((cate === "population" ? d.data.population : d.data.gdp)))
            .attr('opacity', function(d) {
                if(d.data.key === hoveredShape){
                    return 1;
                    // 这里这几个条件判断写的太不优雅了，完全不符合设计原则和设计模式
                } else if((cate === "population" ? d.data.population : d.data.gdp) > maxNum) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr('cursor', 'default')
            .attr('pointer-events', 'none')
            .attr('fill', 'black')
            .style('font-size', '12px')
            .style('font-family', 'Montserrat');

        voronoi.selectAll("path")
            .data(allNodes)
            .enter()
            .append("path")
            .attr('d', d => "M" + d.polygon.join("L") + "Z")
            .style('fill', d => d.parent ? d.parent.color : d.color)
            .attr("stroke", "#F5F5F2")
            .attr("stroke-width", 0)
            .style('fill-opacity', d => d.depth === 2 ? 1 : 0)
            .attr('pointer-events', d => d.depth === 2 ? 'all' : 'none')
            .on("mouseenter", d => {
                let label = name_labels.select(`.label_${d.id}`)
                label.attr("opacity", 1)
                let pop_label = num_labels.select(`.label_${d.id}`)
                pop_label.attr("opacity", 1)
            })
            .on("mouseleave", d => {
                let label = name_labels.select(`.label_${d.id}`)
                label.attr('opacity', d => (cate === "population" ? d.data.population : d.data.gdp) > maxNum ? 1 : 0)
                let pop_label = num_labels.select(`.label_${d.id}`)
                pop_label.attr("opacity", d => (cate === "population" ? d.data.population : d.data.gdp) > maxNum ? 1 : 0)
            })
            .transition()
            .duration(1000)
            .attr("stroke-width", d => 7 - d.depth * 2.8)
            .style('fill', d => d.color);

        svg.append("text")
            .text((cate === "population" ? "人口分布" : "GDP分布"))
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
    }

    const data = getData();
    render("population", data);
    render("gdp", data);

})