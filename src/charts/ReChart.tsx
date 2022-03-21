import React, { useEffect, useState } from 'react';
import { LineChart, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, Label, Tooltip, Text } from 'recharts';
import { useSelector } from 'react-redux';
import { Sample } from '../store/samples.reducer';
import { selectSampleDomain, selectSamplesInRange } from '../store/samples.selector';
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from './chartOptions';
import { unixToLocaleTime, formatLatestTime, formatWattsToKilo } from './utils';
import { selectTimeRange } from '../store/settings.selector';

const ReChart = () => {
    let realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const X_RANGE: number = useSelector(selectTimeRange);
    const domain: number[] = useSelector(selectSampleDomain);

    const [showArea, setShowArea] = useState<boolean>(false);
    const ParentComponent = showArea ? AreaChart : LineChart;

    const [dotsVisible, setDotsVisible] = useState<boolean>(false);

    useEffect(() => {
        if (realPowerSamples.length === 0) return;

    }, [realPowerSamples]);

    const margin = {top: 30, bottom: 60, left: 15, right: 0};
    const extraMargin = {top: 80, bottom: 0, left: 55, right: 10};

    return (
        <div>
            <div>
                <div>
                    <button onClick={() => setShowArea(b => !b)}>{showArea ? 'Hide' : 'Show'} Area</button>
                    <button onClick={() => setDotsVisible(b => !b)} disabled={showArea} >{dotsVisible ? 'Hide' : 'Show'} Points</button>    
                </div>
                <ParentComponent 
                    width={CHART_WIDTH + margin.left + margin.right + extraMargin.left + extraMargin.right} height={CHART_HEIGHT + margin.top + extraMargin.top}
                    data={realPowerSamples} margin={margin}
                    style={{fontSize: 12}}
                >
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5E73EC" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#5E73EC" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    {
                        showArea ?
                        <Area type="monotone" dataKey="value" stroke="#5E73EC" fillOpacity={1} fill="url(#gradient)" /> :
                        <Line type="monotone" dataKey="value" stroke="#5E73EC" strokeWidth={2} dot={dotsVisible} />
                    }
                    <Label value="Actual Power Flow" position="top" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                    <XAxis 
                        dataKey="timestamp" type="number" domain={domain} 
                        label={<Label value={formatLatestTime(X_RANGE)} position='bottom' offset={35} />}
                        angle={-45} dy={20}
                        tickFormatter={(val) => unixToLocaleTime(val)} 
                    />
                    <YAxis 
                        domain={[Y_MIN, Y_MAX]}
                        tickFormatter={(value: number) => formatWattsToKilo(value)}
                        label={<Text x={10} y={200} textAnchor='start' angle={-90}>Utility Power Flow (kW)</Text>}
                    />
                    <Tooltip 
                        formatter={(value: number) => [formatWattsToKilo(value), "Power"]}
                        labelFormatter={(value: number) => unixToLocaleTime(value)}
                    />
                </ParentComponent>
            </div>
        </div>
    )
}

export default ReChart;
