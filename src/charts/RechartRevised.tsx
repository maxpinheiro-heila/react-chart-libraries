import React, { useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Text, ReferenceArea } from 'recharts';
import { useSelector } from 'react-redux';
import { Sample } from '../store/samples.reducer';
import { selectSampleDomain, selectSamplesInRange } from '../store/samples.selector';
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from './chartOptions';
import { unixToLocaleTime, formatWattsToKilo } from './utils';
import { selectCurve } from '../store/settings.selector';
import { Curve } from '../store/settings.reducer';
import { CurveType } from 'recharts/types/shape/Curve';
import { extent } from 'd3-array';

const ReChartRevised = () => {
    let realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const domain: number[] = useSelector(selectSampleDomain);
    const curve: Curve = useSelector(selectCurve);

    const curveRechart: Record<Curve, CurveType> = {
        'basis': 'basis',
        'monotone': 'monotone',
        'natural': 'natural',
    }

    const [dotsVisible, setDotsVisible] = useState<boolean>(false);
    const [animated, setAnimated] = useState<boolean>(false);

    const margin = {top: 50, bottom: 40, left: 10, right: 0};

    const [refAreaLeft, setRefAreaLeft] = useState<string>('');
    const [refAreaRight, setRefAreaRight] = useState<string>('');
    const [zoomConstraints, setZoomConstraints] = useState<{left: number, right: number, top: number, bottom: number} | null>(null);

    const getAxisYDomain = (samples: Sample[], fromX: number, toX: number): [number, number] => {
        const samplesInRange = samples.filter(s => s.timestamp >= fromX && s.timestamp <= toX);
        let [minVal, maxVal] = extent(samplesInRange.map(sample => sample.value));
        return [minVal || 0, maxVal || 0];
    }

    const zoom = () => {
        let refLeft = refAreaLeft, refRight = refAreaRight;
        
        if (refLeft >= refRight || refRight === '') {
            setRefAreaLeft('');
            setRefAreaRight('');
            return;
        }

        // xAxis domain
        if (refLeft > refRight) [refLeft, refRight] = [refRight, refLeft];

        // yAxis domain
        const [bottom, top] = getAxisYDomain(realPowerSamples, Number(refAreaLeft), Number(refAreaRight));

        setRefAreaLeft('');
        setRefAreaRight('');
        setZoomConstraints({left: Number(refLeft), right: Number(refRight), top: top + 20, bottom: bottom - 20});
    }
    
    const zoomOut = () => {
        setRefAreaLeft('');
        setRefAreaRight('');
        setZoomConstraints(null);
    }

    return (
        <div style={{margin: '0px 0px'}}>
            <div>
                <div>
                    <button onClick={() => setAnimated(b => !b)}>Turn {animated ? 'Off' : 'On'} Animation</button> 
                    <button onClick={zoomOut} disabled={zoomConstraints === null}>Zoom Out</button>
                </div>
                <LineChart 
                    width={CHART_WIDTH + margin.left + 80} height={CHART_HEIGHT + margin.top + margin.bottom}
                    data={realPowerSamples} margin={margin}
                    style={{fontSize: 12}}
                    onMouseDown={(e) => setRefAreaLeft(e?.activeLabel || '')}
                    onMouseMove={(e) => refAreaLeft && setRefAreaRight(e?.activeLabel || '')}
                    onMouseUp={zoom}
                >
                    <Line 
                        yAxisId="left"
                        type={curveRechart[curve]} dataKey="value" 
                        stroke="#5E73EC" strokeWidth={2} dot={dotsVisible} 
                        isAnimationActive={animated}
                    />
                    <CartesianGrid stroke="#ccc" opacity={0.5} vertical={false} />
                    <XAxis 
                        hide
                        axisLine={false} tickLine={false}
                        allowDataOverflow
                        dataKey="timestamp" type="number" 
                        domain={zoomConstraints ? [zoomConstraints.left, zoomConstraints.right] : domain} 
                        angle={-45} dy={20}
                        tickFormatter={(val) => unixToLocaleTime(val)} 
                    />
                    <YAxis 
                        yAxisId="left" allowDataOverflow
                        domain={zoomConstraints ? [zoomConstraints.bottom, zoomConstraints.top] : [Y_MIN, Y_MAX]}
                        tickFormatter={(value: number) => String((value / 1000).toFixed(2) )}
                        axisLine={false} tickLine={false}
                        label={<Text x={40} y={CHART_HEIGHT + margin.top + 30} textAnchor='start' style={{fontWeight: 'bold'}}>KW</Text>}
                    />
                    <YAxis 
                        orientation="right" yAxisId="right" allowDataOverflow
                        domain={zoomConstraints ? [zoomConstraints.bottom, zoomConstraints.top] : [Y_MIN, Y_MAX]}
                        tickFormatter={(value: number) => String((value / 1000).toFixed(2) )}
                        axisLine={false} tickLine={false}
                        label={<Text x={CHART_WIDTH + margin.left + 30} y={CHART_HEIGHT + margin.top + 30} textAnchor='start' style={{fontWeight: 'bold'}}>KW</Text>}
                    />
                    <Tooltip 
                        formatter={(value: number) => [formatWattsToKilo(value), "Power"]}
                        labelFormatter={(value: number) => unixToLocaleTime(value)}
                    />
                    { refAreaLeft && refAreaRight && 
                        <ReferenceArea yAxisId="left" x1={refAreaLeft} x2={refAreaRight} 
                            fillOpacity={0.2} fill='#5e73CE'
                        /> 
                    }
                </LineChart>
            </div>
        </div>
    )
}

export default ReChartRevised;
