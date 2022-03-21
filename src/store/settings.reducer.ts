import { combineReducers, Reducer as ReducerType } from "@reduxjs/toolkit";
import { SettingsAction } from "./settings.action";
import { Action } from "./store";

export type Page = 'home' | 'comparison' | 'rechart-demo' | 'revised-charts';
export type Curve = 'basis' | 'monotone' | 'natural';

export namespace SettingsReducer {
    export type State = {
        timeRange: number, // seconds
        page: Page,
        curve: Curve
    }

    export const voidSampleState: State = {
        timeRange: 120,
        page: 'home',
        curve: 'monotone'
    }

    export namespace Reducer {

        const setTimeRange = (state: number, action: Action<number>): number => action.payload;

        const timeRangeReducer: ReducerType<number, Action<number>> = (state = 120, action: Action<number>) => {
            switch(action.type) {
                case SettingsAction.Type.SET_TIME_RANGE:
                    return setTimeRange(state, action);
                default:
                    return state;
            }
        }

        const setPage = (state: Page, action: Action<Page>): Page => action.payload;

        const pageReducer: ReducerType<Page, Action<Page>> = (state = 'home', action: Action<Page>) => {
            switch(action.type) {
                case SettingsAction.Type.SET_PAGE:
                    return setPage(state, action);
                default:
                    return state;
            }
        }

        const setCurve = (state: Curve, action: Action<Curve>): Curve => action.payload;

        const curveReducer: ReducerType<Curve, Action<Curve>> = (state = 'monotone', action: Action<Curve>) => {
            switch(action.type) {
                case SettingsAction.Type.SET_CURVE:
                    return setCurve(state, action);
                default:
                    return state;
            }
        }

        export const settingsReducer = combineReducers<State>({
            timeRange: timeRangeReducer,
            page: pageReducer,
            curve: curveReducer
        })
    }
}
