import { combineReducers, Reducer } from "@reduxjs/toolkit";
import { SampleAction } from "./samples.action";
import { Action } from "./store";

export type Sample = {
    timestamp: number,
    value: number
};

export namespace SampleReducer {
    export type State = {
        samples: Sample[]
    }

    export const voidSampleState: State = {
        samples: []
    }

    export namespace Reducer {
        const addSample = (state: Sample[], action: Action<Sample[]>): Sample[] => ([...state, ...action.payload]);

        const setSamples = (state: Sample[], action: Action<Sample[]>): Sample[] => (action.payload || []);

        const sampleReducer: Reducer<Sample[], Action<Sample[]>> = (state = [], action: Action<Sample[]>) => {
            switch(action.type) {
                case SampleAction.Type.ADD_SAMPLE:
                    return addSample(state, action);
                case SampleAction.Type.SET_SAMPLES:
                    return setSamples(state, action);
                default: 
                    return state;
            }
        }

        export const samplesReducer = combineReducers<State>({
            samples: sampleReducer
        })
    }
}