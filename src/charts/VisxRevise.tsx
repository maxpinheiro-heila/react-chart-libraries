import React, { MouseEventHandler, useCallback, useRef, useState } from "react";
import { LinePath } from "@visx/shape";
import { curveBasis, curveNatural, curveMonotoneX  } from "@visx/curve";
import { Sample } from "../store/samples.reducer";
import { useSelector } from "react-redux";
import { selectSampleDomain, selectSamplesInRange } from "../store/samples.selector";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { CHART_HEIGHT, CHART_WIDTH, Y_MAX, Y_MIN } from "./chartOptions";
import { formatWattsToKilo, unixToLocaleTime } from "./utils";
import { AxisLeft, AxisRight } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { selectCurve } from "../store/settings.selector";
import { Tooltip, useTooltip } from "@visx/tooltip";
import { Curve } from "../store/settings.reducer";
import { CurveFactory } from "d3-shape";
import { localPoint } from "@visx/event";
import { extent } from "d3-array";
import {ScaleLinear} from "d3-scale"

const VisxRevised = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    let realPowerSamples: Sample[] = useSelector(selectSamplesInRange);
    const domain: number[] = useSelector(selectSampleDomain);
    const curve: Curve = useSelector(selectCurve);

    const curveVisx: Record<Curve, CurveFactory> = {
        'basis': curveBasis,
        'monotone': curveMonotoneX,
        'natural': curveNatural
    }

    const [fillArea, setFillArea] = useState<boolean>(false);

    const [refAreaLeft, setRefAreaLeft] = useState<number>(-1);
    const [refAreaRight, setRefAreaRight] = useState<number>(-1);
    const [zoomConstraints, setZoomConstraints] = useState<{left: number, right: number, top: number, bottom: number} | null>(null);
    const [xScaleZoomed, setXScaleZoomed] = useState<ScaleLinear<number, number> | null>(null);
    const [yScaleZoomed, setYScaleZoomed] = useState<ScaleLinear<number, number> | null>(null);

    const marginLeft = 60;
    const marginTop = 50;

    const getX = (d: Sample) => d.timestamp;
    const getY = (d: Sample) => d.value;

    const xScale = scaleLinear<number>({
        domain: domain,
        range: [0, CHART_WIDTH],
        nice: true
    });
    const yScale = scaleLinear<number>({
        domain: [Y_MIN, Y_MAX],
        range: [CHART_HEIGHT, 0],
        nice: true
    })

    let {showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen} = useTooltip();

    let tooltipTimeout: number;

    const handleMouseOver: MouseEventHandler<SVGElement> = (event) => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        if (!svgRef.current) return;

        const point = localPoint(svgRef.current, event);
        if (!point) return;
        const x = xScale.invert(point.x);
        const y = yScale.invert(point.y)

        showTooltip({
            tooltipLeft: event.clientX,
            tooltipTop: event.clientY,
            tooltipData: {x, y}
        })
    }

    const handleMouseLeave = useCallback(() => {
        tooltipTimeout = window.setTimeout(() => {
            hideTooltip();
        }, 300);
    }, [hideTooltip]);

    const renderPoint = (point: {x: number, y: number}) => {
        return (
            <div style={{border: '1px solid #ddd', padding: '0px 10px'}}>
                <p style={{fontWeight: 'bold'}}>{unixToLocaleTime(point.x)}</p>
                <p style={{color: '#5E73CE'}}>Real Power: {formatWattsToKilo(point.y)}</p>
            </div>
        )
    }
    
    const getAxisYDomain = (samples: Sample[], fromX: number, toX: number): [number, number] => {
        const samplesInRange = samples.filter(s => s.timestamp >= fromX && s.timestamp <= toX);
        let [minVal, maxVal] = extent(samplesInRange.map(sample => sample.value));
        return [minVal || 0, maxVal || 0];
    }

    const zoom = () => {
        let refLeft = xScale.invert(refAreaLeft), refRight = xScale.invert(refAreaRight);
        console.log(refLeft + ', ' + refRight);
        
        if (refLeft >= refRight || refRight === -1) {
            setRefAreaLeft(-1);
            setRefAreaRight(-1);
            return;
        }

        // xAxis domain
        if (refLeft > refRight) [refLeft, refRight] = [refRight, refLeft];

        // yAxis domain
        const [bottom, top] = getAxisYDomain(realPowerSamples, refAreaLeft, refAreaRight);

        setRefAreaLeft(-1);
        setRefAreaRight(-1);
        setZoomConstraints({left: Number(refLeft), right: Number(refRight), top: top + 20, bottom: bottom - 20});
        setXScaleZoomed(scaleLinear<number>({
            domain: [refLeft, refRight],
            range: [0, CHART_WIDTH],
            nice: true
        }));
        setYScaleZoomed(scaleLinear<number>({
            domain: [bottom - 20, top + 20],
            range: [0, CHART_WIDTH],
            nice: true
        }))
    }
    
    const zoomOut = () => {
        setRefAreaLeft(-1);
        setRefAreaRight(-1);
        setZoomConstraints(null);
    }

    const numTicks = 9;

    return (
        <div>
            <div style={{display: 'block'}}>
                <button onClick={() => setFillArea(b => !b)}>{fillArea ? 'Hide' : 'Show'} Area</button>
                <button onClick={zoomOut} disabled={zoomConstraints === null}>Zoom Out</button>
            </div>
            <svg ref={svgRef}
                width={CHART_WIDTH + marginLeft + marginLeft} height={CHART_HEIGHT + marginTop + 50}
                onMouseDown={(e) => setRefAreaLeft(e?.clientX || 0)}
                onMouseMove={(e) => refAreaLeft !== -1 && setRefAreaRight(e?.clientX || 0)}
                onMouseUp={zoom}
            >
                <Group left={marginLeft} top={marginTop}>
                    <AxisLeft 
                        scale={zoomConstraints !== null && yScaleZoomed ? yScaleZoomed : yScale}
                        tickFormat={(val) => String(val.valueOf() / 1000)}
                        stroke="#666" tickStroke="#666" 
                        numTicks={numTicks}
                        hideAxisLine hideTicks
                    />
                    <AxisRight
                        scale={zoomConstraints !== null && yScaleZoomed ? yScaleZoomed : yScale} 
                        orientation='right'
                        left={CHART_WIDTH}
                        tickFormat={(val) => String(val.valueOf() / 1000)}
                        stroke="#666" tickStroke="#666" 
                        numTicks={numTicks}
                        hideAxisLine hideTicks
                    />
                    <GridRows 
                        scale={yScale} width={CHART_WIDTH} height={CHART_HEIGHT + marginTop + 90} 
                        stroke="#ccc" strokeOpacity={0.5} 
                        numTicks={numTicks}
                    />
                    { realPowerSamples.length > 0 &&
                        <LinePath<Sample> 
                            data={zoomConstraints !== null ? realPowerSamples.filter(s => s.timestamp >= zoomConstraints.left && s.timestamp <= zoomConstraints.right) : realPowerSamples}
                            x={(d) => xScale(getX(d))}
                            y={(d) => yScale(getY(d))}
                            stroke="#5E73EC" strokeWidth={2} curve={curveVisx[curve]} fill="#5E73EC" fillOpacity={fillArea ? 0.4 : 0}
                            onMouseOver={handleMouseOver} onMouseOut={handleMouseLeave}
                        />
                    }
                    { refAreaLeft !== -1 && refAreaRight !== -1 && refAreaRight > refAreaLeft && <rect x={refAreaLeft - marginLeft} width={refAreaRight - refAreaLeft} height={CHART_HEIGHT} fill="#ccc" fillOpacity={0.3} /> }
                    
                </Group>
            </svg>
            <Tooltip left={tooltipLeft} top={tooltipTop}>
               {tooltipOpen && tooltipData && tooltipData !== {} && renderPoint(tooltipData as {x: number, y: number})}
            </Tooltip>
        </div>
    )
}

export default VisxRevised;
