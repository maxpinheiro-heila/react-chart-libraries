import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SampleAction } from "../store/samples.action";
import { Sample } from "../store/samples.reducer";
import { SettingsAction } from "../store/settings.action";
import { Curve } from "../store/settings.reducer";
import { selectCurve, selectTimeRange } from "../store/settings.selector";
import { curveTypes, timeRangeOptions } from "./chartOptions";

export const ChartControls = (): JSX.Element => {
    const dispatch = useDispatch();
    const X_RANGE: number = useSelector(selectTimeRange);
    const [intervalId, setIntervalId] = useState<any | null>(null);
  
    const addSample = () => {
      const sample: Sample = {
        timestamp: Date.now(),
        value: Math.random() * 1000
      }
      dispatch(SampleAction.addSample([sample]));
    }
  
    const startAutomatic = () => {
      const id = setInterval(addSample, 2000);
      setIntervalId(id);
    }
  
    const stopAutomatic = () => {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  
    const populateChart = () => {
      dispatch(SampleAction.saveSamples([]));
      const time = Date.now();
      let samples: Sample[] = [];
      // assume interval of 2 seconds between each point => number of points = (X_RANGE / 2)
      for (let i = 0; i < (X_RANGE / 2); i++) {
        const sample: Sample = {
          timestamp: time - (i * 2000),
          value: Math.random() * 1000
        }
        samples.push(sample);
      }
      dispatch(SampleAction.saveSamples(samples));
    }
  
    const resetSamples = () => {
      window.localStorage.setItem('samples', JSON.stringify({data: []}));
      dispatch(SampleAction.saveSamples([]));
    }
    
    return (
      <div style={{marginBottom: 10}}>
        <h4>Sample Controls</h4>
        <div>
          <button onClick={populateChart}>Populate Random Samples</button>
          <button onClick={addSample}>Add Random Sample</button>
          <button onClick={resetSamples}>Clear Samples</button>
        </div>
        <button style={{display: 'block', marginTop: '10px'}} onClick={() => intervalId === null ? startAutomatic() : stopAutomatic()}>{intervalId === null ? 'Start' : 'Stop'} Automatic Updating</button>
      </div>
    )
  }
  
export const TimeRangeSelect = (): JSX.Element => {
    const dispatch = useDispatch();
    const X_RANGE = useSelector(selectTimeRange);

    return (
        <div style={{display: 'block', margin: '10px 0px'}}>
        <select value={X_RANGE} onChange={(e) => dispatch(SettingsAction.setTimeRange(Number(e.target.value) || 300))}>
            { timeRangeOptions.map(range => <option value={range.value} key={range.value}>{range.name}</option>) }
        </select>
        </div>
    )
}

export const CurveSelect = (): JSX.Element => {
    const dispatch = useDispatch();
    const curve: Curve = useSelector(selectCurve);

    const strToCurve: Record<string, Curve> = {'basis': 'basis', 'monotone': 'monotone', 'natural': 'natural'}
    
    return (
        <div>
            <label>Curve Type: 
            <select value={curve} onChange={(e) => dispatch(SettingsAction.setCurve(strToCurve[e.target.value] || 'monotone'))}>
                { curveTypes.map(curve => <option value={curve} key={curve}>{curve}</option>) }
            </select>
            </label>
        </div>
    )
}
