import React, { useEffect, useState } from "react";
import { ResponsiveLine, Line, Serie, DatumValue } from "@nivo/line";
import { Tooltip } from "@nivo/tooltip"
import { Sample } from "../store/samples.reducer";
import { useSelector } from "react-redux";
import { selectSampleDomain, selectSamplesInRange } from "../store/samples.selector";
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from "./chartOptions";
import { selectTimeRange } from "../store/settings.selector";
import { format, formatLatestTime, formatWattsToKilo, UnitPrefix, unixToLocaleTime } from "./utils";

const NivoChart = () => {
    const realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const domain: number[] = useSelector(selectSampleDomain);
    const [areaEnabled, setAreaEnabled] = useState<boolean>(false);
    const [pointsVisible, setPointsVisible] = useState<boolean>(true);

    const X_RANGE = useSelector(selectTimeRange);

    const realPowerSerie: Serie = {
        id: 'realPower',
        data: realPowerSamples.map(sample => ({x: sample.timestamp, y: sample.value}))
    }

    const margin = {top: 10, bottom: 100, left: 70, right: 10};

    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setAreaEnabled(b => !b)}>{areaEnabled ? 'Hide' : 'Show'} Area</button>
                <button onClick={() => setPointsVisible(b => !b)}>{pointsVisible ? 'Hide' : 'Show'} Points</button>
            </div>
            <Line 
                width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom} 
                margin={margin} 
                data={[realPowerSerie]} yScale={{type: 'linear', min: Y_MIN, max: Y_MAX}} xScale={{type: 'linear', min: domain[0] || 0, max: domain[1] || 0}}
                isInteractive={true} useMesh={true}
                xFormat={val => unixToLocaleTime(val as number)} yFormat={val => format(val as number, { desiredPrefix: UnitPrefix.Kilo, units: 'W', precision: 2 })}
                colors={['#5e73ce']} curve="monotoneX" enableArea={areaEnabled} enablePoints={pointsVisible}
                axisBottom={{tickValues: 10, ticksPosition: 'before', tickRotation: -45, legend: formatLatestTime(X_RANGE), legendOffset: 80, legendPosition: 'middle', format: val => unixToLocaleTime(val as number)}}
                axisLeft={{legend: 'Utility Power Flow (kW)', legendOffset: -60, legendPosition: 'middle', format: val => format(val as number, { desiredPrefix: UnitPrefix.Kilo, units: 'W', precision: 2 })}}
            />
        </div>
    )
}

export default NivoChart;
