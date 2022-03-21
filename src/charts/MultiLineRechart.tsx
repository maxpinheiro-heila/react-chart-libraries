import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CartesianGrid, Label, Line, LineChart, Tooltip, XAxis, YAxis, Text, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import { DataKey } from "recharts/types/util/types";
import { Sample } from "../store/samples.reducer";
import { selectSampleDomain, selectSamplesInRange } from "../store/samples.selector";
import { selectTimeRange } from "../store/settings.selector";
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from "./chartOptions";
import { formatLatestTime, formatWattsToKilo, map, unixToLocaleTime } from "./utils";
import { ResizableBox } from 'react-resizable';
import { ChartControls, TimeRangeSelect } from "./ChartControls";

export interface MultiSample {
    timestamp: number,
    realPower: number,
    reactivePower: number,
    fakePower: number,
}

type SampleType = 'realPower' | 'reactivePower' | 'fakePower';

interface LineConfig {
    type: SampleType,
    name: string,
    stroke: `#${string}`,
    active: boolean
}

const initialLineConfigs: LineConfig[] = [
    {
        type: 'realPower',
        name: 'Real Power',
        stroke: '#5E73CE',
        active: true
    },
    {
        type: 'reactivePower',
        name: 'Reactive Power',
        stroke: '#3490c9',
        active: true
    },
    {
        type: 'fakePower',
        name: 'Fake Power',
        stroke: '#07b36b',
        active: true
    }
]

const MultiLineRechart = () => {
    const realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const [multiSamples, setMultisamples] = useState<MultiSample[]>([]);
    const X_RANGE: number = useSelector(selectTimeRange);
    const domain: number[] = useSelector(selectSampleDomain);

    const [lineConfigs, setLineConfigs] = useState<LineConfig[]>(initialLineConfigs);
    const margin = {top: 10, bottom: 100, left: 70, right: 10};

    const [dotsVisible, setDotsVisible] = useState<boolean>(false);
    const [showArea, setShowArea] = useState<boolean>(false);
    const [chartDim, setChartDim] = useState<[number, number]>([CHART_WIDTH, CHART_HEIGHT + margin.top + margin.bottom]);

    const generateMultiSamplesFromPower = (samples: Sample[]): MultiSample[] => {
        return samples.map((sample: Sample, idx: number) => {
            const realPower = sample.value;
            const reactivePower = Math.cos(map(realPower, Y_MIN, Y_MAX, 0, 2 * Math.PI)) * 500 + 500; // random cosine using real_power for more randomness
            const fakePower = Math.sin(idx) * 500 + 500; // random sine function
            return {
                timestamp: sample.timestamp,
                realPower,
                reactivePower,
                fakePower
            }
        })
    }

    useEffect(() => {
        if (realPowerSamples.length === 0) {setMultisamples([]); return;};

        const multiSamples: MultiSample[] = generateMultiSamplesFromPower(realPowerSamples);
        setMultisamples(multiSamples);
    }, [realPowerSamples]);

    const handleLegendClick = (data: Payload & {dataKey?: DataKey<any>}) => {
        const key: SampleType = data?.dataKey as SampleType;
        setLineConfigs(configs => configs.map(config => config.type === key ? ({...config, active: !config.active}) : config));
    }

    const ParentComponent = showArea ? AreaChart : LineChart;

    return (
        <div>
            <div style={{fontSize: '12px'}}>
                <ChartControls />
                <div style={{display: 'block', margin: '10px 0px'}}>
                    <h4>Chart Controls</h4>
                    <button onClick={() => setShowArea(b => !b)}>{showArea ? 'Hide' : 'Show'} Area</button>
                    <button onClick={() => setDotsVisible(b => !b)} disabled={showArea}>{dotsVisible ? 'Hide' : 'Show'} Dots</button>
                </div>
                <TimeRangeSelect />
                <ResizableBox
                    handle={<div className="handle"/>}
                    width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom} 
                    minConstraints={[300, 200]}
                    onResize={(e, {size}) => setChartDim([size.width, size.height])}
                >
                    <ResponsiveContainer>
                        <ParentComponent data={multiSamples} margin={{left: 10, top: 30, bottom: 60}} >
                            <defs>
                                {
                                    lineConfigs.map(config => (
                                    <linearGradient id={`gradient-${config.type}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={config.stroke} stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor={config.stroke} stopOpacity={0.1}/>
                                    </linearGradient>
                                    ))
                                }
                            </defs>
                            {
                                lineConfigs.map(config => (
                                    !showArea ?
                                    <Line 
                                        dataKey={config.type} name={config.name} key={config.name} type="monotone"
                                        style={config.active ? {} : {display: 'none'}} stroke={config.stroke} strokeWidth={1.5} dot={dotsVisible} 
                                    /> :
                                    <Area
                                        dataKey={config.type} name={config.name} key={config.name} type="monotone"
                                        style={config.active ? {} : {display: 'none'}} stroke={config.stroke} fill={`url(#gradient-${config.type})`} 
                                    />
                                ))
                            }
                            <Label value="Actual Power Flow" position="top" />
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            
                            <XAxis 
                                dataKey="timestamp" type="number" domain={domain} 
                                angle={-45} dy={20} 
                                tickCount={10}
                                tickFormatter={(val) => unixToLocaleTime(val)}
                                label={<Label value={formatLatestTime(X_RANGE)} position='bottom' offset={35} />}
                            />
                            <YAxis 
                                domain={[Y_MIN, Y_MAX]}
                                tickFormatter={(value: number) => formatWattsToKilo(value)}
                                label={<Text x={10} y={chartDim[1] / 1.7} textAnchor='start' angle={-90}>Utility Power Flow (kW)</Text>}
                            />
                            <Tooltip 
                                formatter={(value: number) => formatWattsToKilo(value)}
                                labelFormatter={(value: number) => unixToLocaleTime(value)}
                            />
                            <Legend 
                                iconType='line' iconSize={14}
                                verticalAlign="top" height={30}
                                payload={lineConfigs.map(config => ({id: config.type, dataKey: config.type, value: config.name, type: 'line', inactive: !config.active, color: config.stroke}))}
                                onClick={handleLegendClick} 
                            />                        
                        </ParentComponent>
                    </ResponsiveContainer>
                </ResizableBox>
            </div>
        </div>
    )
}

export default MultiLineRechart;
