import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
// utils
import { fNumber } from '../../utils/formatNumber';

//
import BaseOptionChart from './BaseOptionChart';

// ----------------------------------------------------------------------


const CHART_HEIGHT = 300;
const LEGEND_HEIGHT = 82;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
    height: CHART_HEIGHT,
    marginTop: theme.spacing(2),
    '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
    '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
        overflow: 'visible',
    },
    '& .apexcharts-legend': {
        height: LEGEND_HEIGHT,
        alignContent: 'center',
        position: 'relative !important',
        borderTop: `solid 1px ${theme.palette.divider}`,
        top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
    },
}));

// ----------------------------------------------------------------------



export default function RadialChart(props) {
    const theme = useTheme();
    const CHART_DATA = props.CHART_DATA;
    const chartOptions = merge(BaseOptionChart(), {
        labels: props.labels,
        legend: { floating: true, horizontalAlign: 'center' },
        fill: {
            type: 'gradient',
            gradient: {
                colorStops: [
                    [
                        {
                            offset: 0,
                            color: theme.palette.primary.light,
                        },
                        {
                            offset: 100,
                            color: theme.palette.primary.main,
                        },
                    ],
                    [
                        {
                            offset: 0,
                            color: theme.palette.warning.light,
                        },
                        {
                            offset: 100,
                            color: theme.palette.warning.main,
                        },
                    ],
                    [
                        {
                            offset: 0,
                            color: theme.palette.info.light,
                        },
                        {
                            offset: 100,
                            color: theme.palette.info.main,
                        },
                    ],
                    [
                        {
                            offset: 0,
                            color: "#ff8a80",
                        },
                        {
                            offset: 100,
                            color: "#f50057",
                        },
                    ],
                    [
                        {
                            offset: 0,
                            color: theme.palette.secondary.main,
                        },
                        {
                            offset: 100,
                            color: theme.palette.secondary.dark,
                        },
                    ],
                ],
            },
        },
        plotOptions: {
            radialBar: {
                hollow: { size: '38%' },
                dataLabels: {
                    value: { offsetY: 16 },

                },
            },
        },
    });

    return (
        <Card>
            <CardHeader title={props.title} />
            <ChartWrapperStyle dir="ltr">
                <ReactApexChart type="radialBar" series={CHART_DATA} options={chartOptions} height={250} />
            </ChartWrapperStyle>
        </Card>
    );
}
