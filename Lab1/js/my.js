const weatherPath = "./data/weather_data.json";
const windSpeed = [];
const moonPhase = [];
let dewPoint = [];
let humidity = [];
let uvIndex = [];
let windBearing = [];
const temperatureMin = [];
const temperatureMax = [];

let dataset = [];
let lastNum = dataset.length;

const allDataList = [windSpeed, moonPhase, dewPoint, humidity, uvIndex, windBearing, temperatureMin, temperatureMax];
const allMetricNames = ["windSpeed", "moonPhase", "dewPoint", "humidity", "uvIndex", "windBearing", "temperatureMin", "temperatureMax"];
const width = 600;
const height = 250;
const leftPadding = 10;
const rightPadding = 10;
const bottomPadding = 30;
const barPadding = 2;
const axisPadding = 20;
let nowIndex = 0; // 当前展示的属性的下标

let xLeft = 0;
let xRight = dataset.length;
let num = dataset.length;
let space = (xRight - xLeft) / num;

const svg = d3
    .select("#my_svg")
    .attr("width", width)
    .attr("height", height + bottomPadding);

// 更新数据
function updateData() {
    let nowData = allDataList[nowIndex];
    switch (allMetricNames[nowIndex]) {
        case "windSpeed": {
            xLeft = 0;
            xRight = 12;
            num = 12;
            space = (xRight - xLeft) / num;
            break;
        }
        case "moonPhase": {
            xLeft = 0.0;
            xRight = 1.0;
            space = 0.1;
            break;
        }
        case "dewPoint": {
            xLeft = -10;
            xRight = 80;
            space = 10;
            break;
        }
        case "humidity": {
            xLeft = 0.30;
            xRight = 1.00;
            space = 0.05;
            break;
        }
        case "uvIndex": {
            xLeft = 1;
            xRight = 11;
            space = 1;
            break;
        }
        case "windBearing": {
            xLeft = 0;
            xRight = 400;
            space = 50;
            break;
        }
        case "temperatureMin": {
            xLeft = 0.00;
            xRight = 80.00
            space = 5;
            break;
        }
        case "temperatureMax": {
            xLeft = 10.00;
            xRight = 95.00;
            space = 5;
            break;
        }
    }
    num = ((xRight - xLeft) / space).toFixed(0);
    dataset = new Array(num);
    for (let i = 0; i < num; i++) {
        dataset[i] = 0;
    }
    for (let i = 0; i < nowData.length; i++) {
        let index = Math.floor((nowData[i] - xLeft) / space);
        dataset[index]++;
    }
}

function processClick() {
    d3.select("#changeButton")
        .on("click", function() {
            lastNum = dataset.length;
            nowIndex = (nowIndex + 1) % allMetricNames.length;
            updateData();
            const xScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([leftPadding, width - rightPadding], 0.05);
            const xAxisScale = d3.scale.linear()
                .domain([xLeft, xRight])
                .rangeRound([leftPadding, width - rightPadding]);
            const yScale = d3.scale.linear()
                .domain([0, d3.max(dataset)])
                .range([0, height - axisPadding]);

            const xAxis = d3.svg.axis()
                .scale(xAxisScale)
                .orient("bottom")
                .ticks(dataset.length);
            // console.log(dataset);
            svg.select("g.axis")
                .call(xAxis);
            svg.select("text.name")
                .text(allMetricNames[nowIndex]);
            let bars = svg.selectAll("rect").data(dataset);
            if(lastNum < dataset.length) {
                bars.enter()
                    .append("rect")
                    .attr({
                        "x" : function(d, i) {
                            return xScale(i);
                        },
                        "y" : function(d) {
                            return height - axisPadding;
                        },
                        "width" : (width - leftPadding - rightPadding) / dataset.length - barPadding,
                        "height" : function(d) {
                            return 0;
                        },
                        "fill" : "rgb(113, 162, 35)"
                    })
                    .on("mouseover", function(d) {
                        d3.select(this)
                            .attr("fill", "orange");
                        const xPosition = parseFloat(d3.select(this).attr("x"));
                        const yPosition = parseFloat(d3.select(this).attr("y")) + 10;
                        // console.log(xPosition);
                        d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#value")
                            .text(d);
                        d3.select("#tooltip").classed("hidden", false);
                    })
                    .on("mouseout", function(d) {
                        d3.select(this)
                            .transition()
                            .attr("fill", "rgb(81, 136, 233)");
                        d3.select("#tooltip").classed("hidden", true);
                    })
                    .transition()
                    .duration(400)
                    .attr("height", function(d) {
                        return yScale(d);
                    })
                    .attr("y", function(d) {
                        return height - yScale(d) - axisPadding;
                    })
                // .ease("linear")
            } else {
                bars.exit()
                    .transition()
                    .duration(400)
                    .each("start", function (){
                        d3.select(this).attr("fill", "rgb(255, 92, 51)");
                    })
                    .attr("height", 0)
                    .attr("y", height - axisPadding)
                    .remove()
            }
            bars.transition()
                .duration(400)
                .each("end", function() {
                    d3.select(this)
                        .attr("fill", "rgb(81, 136, 233)");
                })
                .ease("linear")
                .attr({
                    "x":function(d, i) {
                        return xScale(i);
                    },
                    "y" : function(d, i) {
                        return height - yScale(d) - axisPadding;
                    },
                    "width" : (width - leftPadding - rightPadding) / dataset.length - barPadding,
                    "height" : function(d) {
                        return yScale(d);
                    }
                });

        });
}

function initDiagram() {
    const xScale = d3.scale.ordinal()
        .domain(d3.range(dataset.length))
        .rangeRoundBands([leftPadding, width - rightPadding], 0.05);
    const xAxisScale = d3.scale.linear()
        .domain([xLeft, xRight])
        .rangeRound([leftPadding, width - rightPadding]);
    const yScale = d3.scale.linear()
        .domain([0, d3.max(dataset)])
        .range([0, height - axisPadding]);

    const xAxis = d3.svg.axis()
        .scale(xAxisScale)
        .orient("bottom")
        .ticks(dataset.length);

    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr({
            "x" : function(d, i) {
                return xScale(i);
            },
            "y" : function(d) {
                return height - yScale(d) - axisPadding;
            },
            "width" : (width - leftPadding - rightPadding) / dataset.length - barPadding,
            "height" : function(d) {
                return yScale(d);
            },
            "fill" : "rgb(81, 136, 233)"
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", "orange");
            const xPosition = parseFloat(d3.select(this).attr("x"));
            const yPosition = parseFloat(d3.select(this).attr("y")) + 10;
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#value")
                .text(d);
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .attr("fill", "rgb(81, 136, 233)");
            d3.select("#tooltip").classed("hidden", true);
        });
    svg.append("g")
        .attr({
            "class" : "axis",
            "transform": "translate(0," + (height - axisPadding) + " )"
        })
        .call(xAxis);
    svg.append("text")
        .attr({
            "class" : "name",
            "x":width / 2 - 50,
            "y":height + bottomPadding - 10,
            "fill":"black"
        })
        .style('font-family', 'Arial')
        .text(allMetricNames[nowIndex]);
}

async function main() {
    updateData();
    initDiagram();
    processClick();
}

// 加载数据，调用主函数
d3.json(weatherPath, (error, datas) => {
    for (let i = 0; i < datas.length; i++) {
        for (let j = 0; j < allMetricNames.length; j++) {
            allDataList[j].push(datas[i][allMetricNames[j]]);
        }
    }
    main().then();
});