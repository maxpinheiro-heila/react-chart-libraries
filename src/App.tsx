import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChartComparison, { RevisedChartComparison } from './charts/ChartComparison';
import MultiLineRechart from './charts/MultiLineRechart';
import { SampleAction } from './store/samples.action';
import { Sample } from './store/samples.reducer';
import { selectSamples } from './store/samples.selector';
import { SettingsAction } from './store/settings.action';
import { Page } from './store/settings.reducer';
import { selectPage } from './store/settings.selector';


const App = () => {
    const dispatch = useDispatch();
    const page: Page = useSelector(selectPage);

    const samples: Sample[] = useSelector(selectSamples);

    const lastCookieSave = useRef(0);
    const limitSaving = false;

    const setPage = (page: Page) => {
        window.localStorage.setItem('page', JSON.stringify({page}));
        dispatch(SettingsAction.setPage(page));
    }

    useEffect(() => {
        if (samples.length === 0) return;
        const time = Date.now();
        if (!limitSaving || time - lastCookieSave.current >= 5000) {
            window.localStorage.setItem('samples', JSON.stringify({data: samples}));
            lastCookieSave.current = time;
        }
    }, [samples]);

    useEffect(() => {
        // check for sample cookies
        const localSamples = JSON.parse(window.localStorage.getItem('samples') || '{}');
        if (localSamples.hasOwnProperty('data')) {
            const samples: Sample[] = localSamples.data as Sample[] || [];
            dispatch(SampleAction.saveSamples(samples));
        }

        // check for page cookies
        const localHome = JSON.parse(window.localStorage.getItem('page') || '{}');
        if (localHome.hasOwnProperty('page')) {
            dispatch(SettingsAction.setPage(localHome.page as Page || 'home'))
        }
    }, [])

    const pages: {name: string, page: Page}[] = [{name: "Revised Charts", page: 'revised-charts'}, {name: "Chart Comparison", page: 'comparison'}, {name: "Recharts Demo", page: 'rechart-demo'}];

    return (
        <div>
            {
                page === 'home' && 
                <div>
                    {pages.map(({name, page}) => <h3 key={name} style={{cursor: 'pointer'}} onClick={() => setPage(page)}>{name}</h3>)}
                </div>
            }
            {
                page === 'comparison' && <ChartComparison />
            }
            {
                page === 'revised-charts' && <RevisedChartComparison />
            }
            {
                page === 'rechart-demo' && 
                <div>
                    <h3 style={{cursor: 'pointer'}} onClick={() => setPage('home')}>Back</h3>
                    <MultiLineRechart />
                </div>
            }

        </div>
    )
}

export default App;
