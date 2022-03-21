import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { VictoryAxis, VictoryChart as Chart, VictoryLine } from 'victory';
import { Sample } from '../store/samples.reducer';
import { selectSampleDomain, selectSamplesInRange } from '../store/samples.selector';
import { selectTimeRange } from '../store/settings.selector';
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from './chartOptions';
import { formatLatestTime, formatWattsToKilo, unixToLocaleTime } from './utils';

const VictoryChart = () => {
    const realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const X_RANGE: number = useSelector(selectTimeRange);
    const domain: number[] = useSelector(selectSampleDomain);
    const [animated, setAnimated] = useState<boolean>(true);

    const margin = {top: 10, bottom: 100, left: 70, right: 10};

    const domainXY: {x: [number, number], y: [number, number]} ={x: [domain[0] || 0, domain[1] || 0], y: [Y_MIN, Y_MAX]};

    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setAnimated(b => !b)}>Turn {animated ? 'Off' : 'On'} Animation</button>
            </div>
            <Chart  width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom}>
                <VictoryLine
                    data={realPowerSamples}
                    x="timestamp" y="value"
                    animate={animated}
                    domain={domainXY}
                    interpolation="monotoneX"
                    style={{data: {stroke: '#5E73CE'}}}
                />
                <VictoryAxis crossAxis
                    domain={domainXY}
                    name={formatLatestTime(X_RANGE)}
                    tickFormat={val => unixToLocaleTime(val)}
                    label={formatLatestTime(X_RANGE)}
                />
                <VictoryAxis dependentAxis crossAxis
                    domain={domainXY}
                    label="Utility Power Flow (kW)"
                    tickFormat={val => formatWattsToKilo(val)}
                    style={{grid: {stroke: '#eee'}}}
                />
            </Chart>

        </div>
    )
}

export default VictoryChart;
