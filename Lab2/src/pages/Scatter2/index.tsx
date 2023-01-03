import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useModel } from 'umi';
import './index.less';
import data from '../../../public/data/miserables.json';
const Scatter2: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { setS1Data } = useModel('test');
    const margin = { left: 30, right: 10, top: 10, bottom: 20 };

    const drawScatter = (data: any[]) => {
        const width = svgRef.current?.clientWidth!;
        const height = svgRef.current?.clientHeight!;
        const clipWidth = width - margin.left - margin.right;
        const clipHeight = height - margin.top - margin.bottom;

        // 这个要放在绘图函数里面，源代码是错的······
        const svg = d3.select(svgRef.current).select('.main');
        svg.selectAll('.main').selectAll('*').remove(); // 刷新时重新绘制
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // 创建一个仿真器simulation
        const nodesData = (data as any).nodes;
        const linksData = (data as any).links;

        const simulation = d3.forceSimulation()
            .nodes(nodesData as any)
            .force('charge', d3.forceManyBody())
            .force("link", d3.forceLink(linksData).id(d => (d as any).id))
            .force('x', d3.forceX(width / 2))
            .force('y', d3.forceY(height / 2));

        // @ts-ignore
        simulation.force('charge').strength(-50);

        // 添加边
        const simulationLinks = svg
            .append('g')
            .attr('class', 'linkGroup')
            .selectAll('line')
            .data(linksData)
            .enter()
            .append('line')
            .attr('stroke', d =>'rgb(198, 198, 198)')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', (d: any) => Math.sqrt((d as any).value));

        // 添加点
        const simulationNodes = svg
            .append('g')
            .attr('class','nodeGroup')
            .selectAll('node')
            .data(nodesData)
            .join('g')
            .attr('class', 'node');

        // 绘制圆点
        const circle = simulationNodes
            .append('circle')
            .attr('r', 3)
            .attr('fill', 'black');

        simulation.on('tick', ticked);
        // 为仿真器添加ticked函数
        function ticked() {
            (simulationLinks as any)
                .attr('x1', (d : any) => (d as any).source.x)
                .attr('y1', (d : any) => (d as any).source.y)
                .attr('x2', (d : any) => (d as any).target.x)
                .attr('y2', (d : any) => (d as any).target.y);

            (simulationNodes as any)
                .attr('transform', (d: { x: any; y: any; }) =>`translate(${d.x}, ${d.y})`);
        }

        // 定义矩形选择框

        const brush = d3
            .brush()
            .extent([
                [0, 0],
                [clipWidth, clipHeight],
            ])
            // 补全矩形选择框执行结束要执行的函数 这里注意怎样传出数据
            .on('end', ({ selection }) => {
                if(selection) {
                    const [[x0, y0], [x1, y1]] = selection;
                    const value = d3
                        .selectAll('.node')
                        .select('circle')
                        .attr('fill', 'black')
                        .filter((d : any) => {
                            return (
                                x0 <= d.x && x1 >= d.x &&
                                y0 <= d.y && y1 >= d.y
                            )
                        })
                        .attr('fill', 'blue')
                        .data();
                    setS1Data(value as any);
                } else {
                    setS1Data(null as any);
                    d3.selectAll('.node')
                        .select('circle')
                        .attr('fill', 'black');
                }
            });
        // 为svg添加选择框
        svg.call(brush as any);
    };

    useEffect(() => {
        drawScatter(data as any);
    }, []);

    return (
        <svg ref={svgRef} style={{ width: '50vw', height: '100vh',}}>
            <g className="force" transform={`translate(${margin.left + 200}, ${margin.top + 300})`}>

            </g>
            <g className="main" transform={`translate(${margin.left}, ${margin.top})`}>
            </g>
        </svg>
    );
};

export default Scatter2;
