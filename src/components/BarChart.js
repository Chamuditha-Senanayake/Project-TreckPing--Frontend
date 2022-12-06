import React, { Component } from "react";
import Chart from "react-apexcharts";

class BarChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    id: "basic-bar",
                    foreColor: '#ffffff'
                },
                xaxis: {
                    categories: props.xAxis,
                },

                colors: ['#ad4a4f'],
                // stroke: {
                //     width: 3
                // },

                fill: {
                    type: 'gradient',

                    gradient: {
                        gradientToColors: ['#e8a53b'],
                        shade: 'dark',
                        type: 'vertical',
                        shadeIntensity: 0.5,
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100]
                    }
                },
            },

            series: [
                {
                    name: "series-1",
                    data: props.values
                }
            ]
        };
    }

    render() {
        return (
            <div className="app">
                <div className="row">
                    <div className="mixed-chart">
                        <Chart
                            options={this.state.options}
                            series={this.state.series}
                            type="bar"
                            width="500"
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default BarChart;