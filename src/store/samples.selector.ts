import { createSelector, Selector } from 'reselect';
import { Sample } from "./samples.reducer";
import { AppReducer } from "./store";
import { selectTimeRange } from './settings.selector';
import { extent } from 'd3-array';

export const selectSamples = (state: AppReducer.AppState): Sample[] => state.samples.samples;

export const selectSamplesSorted: Selector<AppReducer.AppState, Sample[]> = createSelector(
    selectSamples,
    (samples: Sample[]) => samples.sort((a, b) => a.timestamp - b.timestamp)
)

export const selectSamplesInRange: Selector<AppReducer.AppState, Sample[]> = createSelector(
    selectSamplesSorted,
    selectTimeRange,
    (samples: Sample[], timeRange: number) => samples.filter(sample => sample.timestamp >= Date.now() - timeRange * 1000)
)

export const selectSampleDomain: Selector<AppReducer.AppState, number[]> = createSelector(
    selectSamplesInRange,
    selectTimeRange,
    (samples: Sample[], X_RANGE: number) => {
        let [minTime, maxTime] = extent(samples.map(sample => sample.timestamp));
        maxTime = maxTime || 0;
        minTime = maxTime - (X_RANGE * 1000);
        return [minTime, maxTime];
    }
)
