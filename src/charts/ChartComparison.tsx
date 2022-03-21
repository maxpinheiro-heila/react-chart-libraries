import React from 'react';
import { useDispatch } from 'react-redux';
import ApexChart from './ApexChart';
import ReChart from './ReChart';
import VisxChart from './VisxChart';
import { SettingsAction } from '../store/settings.action';
import { Page } from '../store/settings.reducer';
import NivoChart from './NivoChart';
import { CHART_HEIGHT, CHART_WIDTH } from './chartOptions';
import ReactVisChart from './ReactVisChart';
import VictoryChart from './VictoryChart';
import figmaChart from '../figmachart.png';
import ReChartRevised from './RechartRevised';
import VisxRevised from './VisxRevise';
import { ChartControls, CurveSelect, TimeRangeSelect } from './ChartControls';

const margin = {top: 10, bottom: 100, left: 70, right: 10};

export const RevisedChartComparison = () => {
  const dispatch = useDispatch();
  const setPage = (page: Page) => {
      window.localStorage.setItem('page', JSON.stringify({page}));
      dispatch(SettingsAction.setPage(page));
  }
  
  return (
    <div>
      <h4 style={{cursor: 'pointer'}} onClick={() => setPage('home')}>Back</h4>
      <ChartControls />
      <CurveSelect />
      <TimeRangeSelect />
      <div style={{display: 'flex', width: '100vw', flexWrap: 'wrap'}}>
        <img src={figmaChart} alt="figma design" width={CHART_WIDTH + margin.left + margin.right} height={CHART_HEIGHT + margin.top + margin.bottom} />
        <ReChartRevised />
        <VisxRevised />
      </div>
    </div>
  )
}

const ChartComparison = () => {
  const dispatch = useDispatch();

  const demos: {name: string, Chart: () => JSX.Element}[] = [
    {name: "ApexCharts", Chart: ApexChart},
    {name: "Recharts", Chart: ReChart},
    {name: "Nivo", Chart: NivoChart},
    {name: "Victory", Chart: VictoryChart},
    {name: "React-Vis", Chart: ReactVisChart},
    {name: "Visx", Chart: VisxChart}
  ]

  const setPage = (page: Page) => {
      window.localStorage.setItem('page', JSON.stringify({page}));
      dispatch(SettingsAction.setPage(page));
  }

  return (
    <div className="App" style={{margin: '10px'}}>
      <h4 style={{cursor: 'pointer'}} onClick={() => setPage('home')}>Back</h4>
      <ChartControls />
      <TimeRangeSelect />
      <div style={{display: 'flex', width: '100vw', flexWrap: 'wrap'}}>
      {
        demos.map(({name, Chart}) => 
          <div style={{marginRight: 20}}>
            <h2>{name}</h2>
            <Chart />
          </div>
       )
      }
      </div>
    </div>
  );
}

export default ChartComparison;
