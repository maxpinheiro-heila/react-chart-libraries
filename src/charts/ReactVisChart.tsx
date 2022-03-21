import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { XYPlot, LineSeries, HorizontalGridLines, XAxis, YAxis, Hint, LineSeriesPoint } from "react-vis";
import { Sample } from "../store/samples.reducer";
import { selectSampleDomain, selectSamplesInRange } from "../store/samples.selector";
import { selectTimeRange } from "../store/settings.selector";
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from "./chartOptions";

import "../../node_modules/react-vis/dist/style.css";
import { formatLatestTime, formatWattsToKilo, unixToLocaleTime } from "./utils";

const ReactVisChart = () => {
    const realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const data: {x: number, y: number}[] = realPowerSamples.map(sample => ({x: sample.timestamp, y: sample.value}));
    const X_RANGE: number = useSelector(selectTimeRange);
    const domain: number[] = useSelector(selectSampleDomain);

    const [animated, setAnimated] = useState<boolean>(true);
    const [hoverVal, setHoverVal] = useState<LineSeriesPoint | null>(null);

    useEffect(() => {
        setTimeout(() => setHoverVal(null), 3000);
    }, [hoverVal]);

    const margin = {top: 10, bottom: 100, left: 70, right: 10};

    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setAnimated(b => !b)}>Turn {animated ? 'Off' : 'On'} Animation</button>
            </div>
            <XYPlot 
                margin={margin}
                dontCheckIfEmpty={true}
                xDomain={domain} yDomain={[Y_MIN, Y_MAX]}
                width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom} 
            >
                <HorizontalGridLines />
                <LineSeries 
                    animation={animated}
                    data={data}
                    stroke="#5E73CE"
                    curve="curveMonotoneX"
                    onNearestX={(val) => setHoverVal(val)}
                    onSeriesMouseOut={() => setHoverVal(null)}

                />
                <XAxis 
                    title={formatLatestTime(X_RANGE)}
                    tickTotal={10}
                    tickLabelAngle={-45}
                    tickFormat={val => unixToLocaleTime(val)}
                />
                <YAxis  
                    title="Utility Power Flow"
                    tickFormat={val => formatWattsToKilo(val)}
                />
                { hoverVal && 
                    <Hint value={hoverVal}>
                        <div style={{backgroundColor: '#fff', color: 'black',  borderRadius: '10%'}}>
                            <p style={{backgroundColor: '#eee', padding: '3px 5px'}}>{unixToLocaleTime(hoverVal.x)}</p>
                            <p>Real Power: {formatWattsToKilo(hoverVal.y)}</p>
                        </div>
                    </Hint>
                }
            </XYPlot>
        </div>
    )
}

export default ReactVisChart;
