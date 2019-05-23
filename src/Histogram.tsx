import * as React from "react";
import {Component} from "react";
import * as d3 from "d3";

class BarChart extends Component {
    componentDidMount() {
        this.drawChart();
    }


    async drawChart() {

        // get data source
        const data: any = await d3.json("histogram_buildings.json").then((data: any) => {

            return data.map(({name, height}: { name: string, height: string }) => ({
                name,
                height: parseInt(height)
            }));
        });

        // define margin, width and height for canvas
        const margin = {left: 100, right: 10, top: 10, bottom: 150};
        const width = 600 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const {left: mLeft, right: mRight, top: mTop, bottom: mBottom} = margin;

        // center chart on canvas, and add margin
        const canvas = d3.select("#chart-area")
            .append("svg")
            .attr("width", width + mLeft + mRight)
            .attr("height", height + mTop + mBottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // scale x and y-axis
        const scaleXAxis = d3.scaleBand()
            .domain(data.map(({name}: {name: string}) => name))
            .range([0, width])
            .paddingInner(0.3)
            .paddingOuter(0.3);

        const scaleYAxis = d3.scaleLinear()
            .domain([0,d3.max(data, ({height}) => height)])
            .range([height, 0]);

        // add labels to x and y-axis
        canvas.append("text")        // x label
            .attr("class", "x axis-label")
            .attr("x", width / 2)
            .attr("y", height + 140)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text("The world's tallest buildings");

        canvas.append("text")        // y label
            .attr("class", "y axis-label")
            .attr("x", - (height/2))
            .attr("y", -60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Height (m)");

        // define number of ticks on the axis and ticks display name
        const yAxisCall = d3.axisLeft(scaleYAxis)
            .ticks(5)
            .tickFormat((d) => d + "m");

        // add y-axis ticks and display name to canvas
        canvas.append("g")
            .attr("class", "y-axis")
            .call(yAxisCall);

        const xAxisCall = d3.axisBottom(scaleXAxis);
        canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxisCall)
            .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-40)");

        // construct rectangles from data source
        const histogram = canvas.selectAll("rect").data(data);

        // combine everything to a histogram
        histogram.enter()
            .append("rect")
        // @ts-ignore
            .attr("x", ({name}) => scaleXAxis(name))
            .attr("y", ({height}: {height: number}) => scaleYAxis(height))
            .attr("width", () => 40)
            .attr("height", ({height: dataItemHeight}: {height: number}) => height - scaleYAxis(dataItemHeight))
            .attr("fill", "grey")

    }
    render(){
        return <div id={"chart-area"}/>
    }
}

export default BarChart;