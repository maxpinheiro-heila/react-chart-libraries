import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Sample } from '../store/samples.reducer';
import { selectSampleDomain, selectSamplesInRange } from '../store/samples.selector';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { CHART_HEIGHT, CHART_WIDTH, MAX_READS, Y_MAX, Y_MIN } from './chartOptions';
import { selectTimeRange } from '../store/settings.selector';
import { format, getAsTimeWithSeconds, UnitPrefix } from './utils';

interface RealPowerDatum {
    x: number,
    y: number
}

export interface ApexSerie {
    name: string,
    data: RealPowerDatum[]
}

const voidChartData: ApexSerie = {
    name: 'Real Power',
    data: []
}

const getApexChartOptions = (timezone: string, minX: number, maxX: number, X_RANGE: number, animated = false): ApexCharts.ApexOptions => ({
    xaxis: {
        type: 'datetime',
        min: minX,
        max: maxX,
        //range: X_RANGE * 1000,
        title: {
            text: 'Last ' + (X_RANGE % 60 === 0 ? X_RANGE / 60 + ' Minutes' : X_RANGE + ' Seconds')
        },
        labels: {
            formatter: (x) => getAsTimeWithSeconds(x, timezone )
        }
    },
    yaxis: {
        min: Y_MIN,
        max: Y_MAX,
        title: {
            text: 'Utility Power Flow (kW)'
        },
        labels: {
            formatter: (y) => format(y, { desiredPrefix: UnitPrefix.Kilo, units: 'W', precision: 2 })
        }
    },
    /*title: {
        text: 'Actual Power Flow',
        align: 'left'
    },*/
    theme: {
        mode: 'light'
    },
    colors: [ '#5E73EC', '#b0ce1d', '#ff1d3f', '#ff1d3f' ],
    chart: {
        animations: {
            enabled: animated,
            easing: 'easeinout'
        },
        toolbar: {
            show: false
        },
        zoom: {
            enabled: false
        }
    },
    grid: {
        borderColor: '#E9EAEC'
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    markers: {
        size: 0,
        hover: {
        size: undefined,
        sizeOffset: 4
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'left',
        itemMargin: {
        horizontal: 4,
        vertical: 5
        }
    }
})

const ApexChart = () => {
    const realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const [series, setSeries] = useState<ApexSerie>(voidChartData);
    const timezone = 'est';
    const X_RANGE: number = useSelector(selectTimeRange);

    const domain: number[] = useSelector(selectSampleDomain);
    const [animated, setAnimated] = useState<boolean>(true)    

    const options: ApexCharts.ApexOptions = getApexChartOptions(timezone, domain[0] || 0, domain[1] || 0, X_RANGE, animated);

    useEffect(() => {
        if (realPowerSamples.length === 0) return;

        //const time = Date.now();
        
        setSeries((s: ApexSerie) => {
            const data = [...realPowerSamples.map(sample => ({x: sample.timestamp, y: sample.value}))]//.filter(a => a.x >= time - X_RANGE * 1000)
                .sort((a, b) => a.x - b.x);
            const serie = {
                ...s,
                data: data.slice(data.length > MAX_READS ? data.length - MAX_READS : 0, data.length)
            }
            return serie;
        })
    }, [realPowerSamples]);

    const margin = {top: 10, bottom: 100, left: 70, right: 10};

    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setAnimated(b => !b)}>Turn {animated ? 'Off' : 'On'} Animation</button>
            </div>
            <Chart 
                options={options} series={[ series ]} type="line" 
                width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom} />
        </div>
    )
}

export default ApexChart;
