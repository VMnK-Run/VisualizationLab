import React, { useEffect, useRef} from 'react';
import * as d3 from 'd3';
import { useModel } from 'umi';
import './index.less';

const Scatter1: React.FC = () => {
    const { s1Data } = useModel('test');
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = { left: 30, right: 10, top: 10, bottom: 20 };
    // 每次要清空svg 不然多次框选会重叠
    // d3.select(svgRef.current).select('.main').selectAll('*').remove();
    const drawScatter = (data: any[]) => {

        const width = svgRef.current?.clientWidth!;
        const height = svgRef.current?.clientHeight!;
        const clipWidth = width - margin.left - margin.right;
        const clipHeight = height - margin.top - margin.bottom;
        const svg = d3.select(svgRef.current).select('.main');
        svg.selectAll('.axis').remove(); // 重新画坐标轴
        let datas = data.map(function (d) {
            return d.group;
        });
        let dataNumMap:Map<number, number> = new Map();
        // 计算各个分组的个数
        for (let i = 0; i < datas.length; i++) {
            if(dataNumMap.has(datas[i])) {
                // @ts-ignore
                dataNumMap.set(datas[i], dataNumMap.get(datas[i]) + 1);
            } else {
                dataNumMap.set(datas[i], 1);
            }
        }

        let arrayObj = Array.from(dataNumMap);
        arrayObj.sort(function (a, b){return a[0] - b[0]});
        // @ts-ignore
        let group = [];
        let nums = [];
        for(let i = 0; i < arrayObj.length; i++) {
            group.push(arrayObj[i][0]);
            nums.push(arrayObj[i][1]);
        }

        // 设置x和y的比例尺
        let padding = { left: 0, top: 400, right: 0, bottom: 30 };
        const xScale = d3.scaleBand()
            .domain(d3.range(nums.length) as [any, any])
            .range([0, clipWidth])
            .paddingInner(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(nums)] as [any, any])
            .range([clipHeight - margin.bottom, margin.top]);



        // 设置x轴和y轴
        function xAxis(g : any) {
            g.attr("transform", `translate(0,${height - margin.bottom - padding.bottom})`)
                .attr("class", "axis")
                .call(d3.axisBottom(xScale)
                .tickFormat((i:any) => {
                    // @ts-ignore
                    return group[i];
                }))
        }

        const yAxis = d3.axisLeft(yScale);

        svg.append("g").call(xAxis);
        svg.append("g").call(yAxis).attr("class", "axis");
        // 绘制直方图
        const bars = svg.select(".bars").selectAll("rect").data(nums);
        // 进入
        bars.enter()
            .append("rect")
            .transition()
            .attr("x", (d : any, i:any) => xScale(i) as any)
            .attr("fill", "royalblue")
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("y", height - margin.bottom - padding.bottom)
            .transition()
            .duration(500)
            .attr("height", (d : any) => yScale(0) - yScale(d))
            .attr("y", (d : any) => yScale(d))
        // 退出
        bars.exit()
            .transition()
            .duration(500)
            .attr("height", 0)
            .attr("y",height - margin.bottom - padding.bottom)
            .remove();
        // 过渡
        bars.transition()
            .duration(500)
            .attr("x", (d:any, i:any) => xScale(i) as any)
            .attr("y", (d:any) => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", (d : any) => yScale(0) - yScale(d))
    };

    useEffect(() => {
        if(s1Data != null && s1Data.nodes == null) {
            drawScatter(s1Data as any);
        }
    }, [s1Data]);

    return (
        <svg
            ref={svgRef}
            style={{
                width: '50vw',
                height: '100vh',
            }}
        >
            <g
                className="main"
                transform={`translate(${margin.left}, ${margin.top})`}
            >
            <g className="bars"></g>
            </g>
        </svg>
    );
};

export default Scatter1;
