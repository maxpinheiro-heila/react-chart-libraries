import { combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { SampleReducer } from "./samples.reducer";
import { SettingsReducer } from "./settings.reducer";

export interface Action<K> {
    type: string,
    payload: K
}

export namespace AppReducer {
    export interface AppState {
        samples: SampleReducer.State;
        settings: SettingsReducer.State;
    }

    export const appReducer: Reducer<AppState> = combineReducers({
        samples: SampleReducer.Reducer.samplesReducer,
        settings: SettingsReducer.Reducer.settingsReducer
    })
    
}

export const store = configureStore({
    reducer: AppReducer.appReducer
})