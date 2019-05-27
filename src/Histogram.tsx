import * as React from "react";
import {Component} from "react";
import * as d3 from "d3";


class BarChart extends Component {
    componentDidMount() {
        this.drawChart();
    }


    async drawChart() {


        // define margin, width and height for canvas
        const margin = {left: 100, right: 10, top: 10, bottom: 150};
        const width = 600 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const {left: mLeft, right: mRight, top: mTop, bottom: mBottom} = margin;
        let flag = true;

        // center chart on canvas, and add margin
        const canvas = d3.select("#chart-area")
            .append("svg")
            .attr("width", width + mLeft + mRight)
            .attr("height", height + mTop + mBottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // get data source
        const data: any = await d3.json("histogram_buildings.json").then((data: any) => {

            return data.map(({name, height}: { name: string, height: string }) => ({
                name,
                height: parseInt(height)
            }));
        });

        // scale x and y-axis
        const scaleXAxis = d3.scaleBand()
            .range([0, width])
            .paddingInner(0.3)
            .paddingOuter(0.3)

        // Y-axis
        const scaleYAxis = d3.scaleLinear()
            .range([height, 0]);


        // x label
        canvas.append("text")
            .attr("class", "x axis-label")
            .attr("x", width/2)
            .attr("y", height + 140)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text("The world's tallest buildings");

        // y label
        canvas.append("text")
            .attr("class", "y axis-label")
            .attr("x", - (height/2))
            .attr("y", -60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Height (m)");

        // append to canvas outside update function to prevent canvas being redrawn every update tick
        const xAxisGroup = canvas
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)

        const yAxisGroup = canvas.append("g")
            .attr("class", "y-axis")

        d3.interval(() => {
            flag = !flag;

            const update = function(){

                scaleXAxis.domain(data.map(({name}: {name: string}) => name))
                scaleYAxis.domain([0,d3.max(data, ({height}) => height)])

                const yAxisCall = d3.axisLeft(scaleYAxis)
                    .ticks(5)
                    .tickFormat((d) => d + "m");

                // X-axis
                const xAxisCall = d3.axisBottom(scaleXAxis);

                xAxisGroup
                    .call(xAxisCall)
                    .selectAll("text")
                    .attr("y", "10")
                    .attr("x", "-5")
                    .attr("text-anchor", "end")
                    .attr("transform", "rotate(-40)");

                // Y-axis
                yAxisGroup.call(yAxisCall);


                // JOIN new data with old elements
                const histogram = canvas.selectAll("rect").data(data);

                // EXIT old elements not present in new data
                histogram.exit().remove();

                // UPDATE old elements present in new data
                histogram
                // @ts-ignore
                    .attr("x", ({name}) => scaleXAxis(name))
                    .attr("y", ({height}: { height: number }) => scaleYAxis(height))
                    .attr("width", () => 40)
                    .attr("height", ({height: dataItemHeight}: { height: number }) => height - scaleYAxis(dataItemHeight));

                // ENTER new elements present in new data
                histogram.enter()
                    .append("rect")
                    // @ts-ignore
                    .attr("x", ({name}) => scaleXAxis(name))
                    .attr("y", ({height}: { height: number }) => scaleYAxis(height))
                    .attr("width", () => 40)
                    .attr("height", ({height: dataItemHeight}: { height: number }) => height - scaleYAxis(dataItemHeight))
                    .attr("fill", "grey");
            }();
        }, 1000)
    }

    render(){
        return <div id={"chart-area"}/>
    }
}

export default BarChart;