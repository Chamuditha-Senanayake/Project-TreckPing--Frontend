import merge from 'lodash/merge';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box, TextField } from '@mui/material';
// components
import BaseOptionChart from './BaseOptionChart';

// ----------------------------------------------------------------------



export default function BarChart(props) {

    const CHART_DATA = props.CHART_DATA
    const [seriesData, setSeriesData] = useState(props.initialYear);

    const handleChangeSeriesData = (event) => {
        setSeriesData(Number(event.target.value));
    };

    const chartOptions = merge(BaseOptionChart(), {
        plotOptions: { bar: { columnWidth: '34%' }, },
        stroke: {
            show: true,
            width: 0.3,
            colors: ['black'],
        },
        fill: { type: ['gradient', 'solid', 'gradient'] },

        xaxis: {
            categories: props.label,
        },
        tooltip: {
            y: {
                formatter: (val) => `$${val}`,
            },
        },
    });

    return (
        <Card>
            <CardHeader
                title={props.title}
                subheader={props.subTitle}
                action={
                    <TextField
                        select
                        fullWidth
                        value={seriesData}
                        SelectProps={{ native: true }}
                        onChange={handleChangeSeriesData}
                        sx={{
                            '& fieldset': { border: '0 !important' },
                            '& select': { pl: 1, py: 0.5, pr: '24px !important', typography: 'subtitle2' },
                            '& .MuiOutlinedInput-root': { borderRadius: 0.75, bgcolor: 'background.neutral' },
                            '& .MuiNativeSelect-icon': { top: 4, right: 0, width: 20, height: 20 },
                        }}
                    >
                        {CHART_DATA.map((option) => (
                            <option key={option.year} value={option.year}>
                                {option.year}
                            </option>
                        ))}
                    </TextField>
                }
            />

            {CHART_DATA.map((item) => (
                <Box key={item.year} sx={{ mt: 1, mx: 3 }} dir="ltr">
                    {item.year === seriesData && (
                        <ReactApexChart type="bar" series={item.data} options={chartOptions} height={364} />
                    )}
                </Box>
            ))}
        </Card>
    );
}
