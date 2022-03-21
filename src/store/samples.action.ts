import { Sample } from "./samples.reducer";

export namespace SampleAction {
    export namespace Type {
        export const ADD_SAMPLE = 'ADD_SAMPLE';
        export const SET_SAMPLES = 'SET_SAMPLES';
    }
    
    export interface AddSample {
        type: typeof Type.ADD_SAMPLE;
        payload: Sample[];
    }

    export const addSample = (payload: Sample[]): AddSample => ({
        type: Type.ADD_SAMPLE,
        payload
    })

    export interface SetSamples {
        type: typeof Type.SET_SAMPLES;
        payload: Sample[];
    }

    export const saveSamples = (payload: Sample[]): SetSamples => ({
        type: Type.SET_SAMPLES,
        payload
    })
}