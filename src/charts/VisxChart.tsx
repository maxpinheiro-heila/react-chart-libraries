import React, { useEffect, useState } from "react";
import { LinePath } from "@visx/shape";
import { curveBasis as curve  } from "@visx/curve";
import { Sample } from "../store/samples.reducer";
import { useSelector } from "react-redux";
import { selectSampleDomain, selectSamplesInRange } from "../store/samples.selector";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from "./chartOptions";
import { format, formatLatestTime, UnitPrefix, unixToLocaleTime } from "./utils";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { selectTimeRange } from "../store/settings.selector";
import { Tooltip } from "@visx/tooltip";

const VisxChart = () => {
    let realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const X_RANGE: number = useSelector(selectTimeRange);
    const domain: number[] = useSelector(selectSampleDomain);

    const [fillArea, setFillArea] = useState<boolean>(false);

    const margin = 10;

    const getX = (d: Sample) => d.timestamp;
    const getY = (d: Sample) => d.value;
    const formatTime = (timestamp: number) => unixToLocaleTime(timestamp);

    const xScale = scaleLinear<number>({
        domain: domain,
        range: [0, CHART_WIDTH],
        nice: true
    });
    const yScale = scaleLinear<number>({
        domain: [Y_MIN, Y_MAX],
        range: [0, CHART_HEIGHT],
        nice: true
    });
    const yScaleInverse = scaleLinear<number>({
        domain: [Y_MIN, Y_MAX],
        range: [CHART_HEIGHT, 0],
        nice: true
    })

    useEffect(() => {
        if (realPowerSamples.length === 0) return;

    }, [realPowerSamples]);

    const numTicks = 10;
    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setFillArea(b => !b)}>{fillArea ? 'Hide' : 'Show'} Area</button>
            </div>
            <svg width={CHART_WIDTH + margin * 10} height={CHART_HEIGHT + margin * 10} >
                <Group left={margin * 8} top={margin}>
                    <AxisBottom 
                        scale={xScale} numTicks={numTicks}
                        labelProps={{fontSize: 12, dy: 40}} label={formatLatestTime(X_RANGE)} top={CHART_HEIGHT}
                        stroke="#666" tickStroke="#666" 
                        tickFormat={(val) => formatTime(val.valueOf())} 
                        tickLabelProps={(val) => ({transform: `rotate(-45 ${xScale(val) + 45} 25)`, fontSize: 10})}
                    />
                    <AxisLeft 
                        scale={yScaleInverse} label="Utility Power Flow (kW)" labelProps={{fontSize: 12, dx: -15, dy: 40}}
                        tickFormat={(val) => format(val.valueOf(), { desiredPrefix: UnitPrefix.Kilo, units: 'W', precision: 2 })}
                        stroke="#666" tickStroke="#666" />
                    <GridRows strokeDasharray="5 5" scale={yScale} width={CHART_WIDTH} height={CHART_HEIGHT} stroke="#111" strokeOpacity={0.2} />
                    { realPowerSamples.length > 0 &&
                        <LinePath<Sample> 
                            data={realPowerSamples} x={(d) => xScale(getX(d))} y={(d) => yScaleInverse(getY(d))} 
                            stroke="#5E73EC" strokeWidth={2} curve={curve} fill="#5E73EC" fillOpacity={fillArea ? 0.4 : 0}
                        />
                    }
                </Group>
            </svg>
            <Tooltip />
        </div>
    )
}

export default VisxChart;
