import { Curve, Page } from "./settings.reducer"

export namespace SettingsAction {
    export namespace Type {
        export const SET_TIME_RANGE = 'SET_TIME_RANGE';
        export const SET_PAGE = 'SET_PAGE';
        export const SET_CURVE = 'SET_CURVE';
    }

    export interface SetTimeRange {
        type: typeof Type.SET_TIME_RANGE,
        payload: number
    }

    export const setTimeRange = (payload: number): SetTimeRange => ({
        type: Type.SET_TIME_RANGE,
        payload
    })

    export interface SetPage {
        type: typeof Type.SET_PAGE,
        payload: Page
    }

    export const setPage = (payload: Page): SetPage => ({
        type: Type.SET_PAGE,
        payload: payload
    })

    export interface SetCurve {
        type: typeof Type.SET_CURVE,
        payload: Curve
    }

    export const setCurve = (payload: Curve): SetCurve => ({
        type: Type.SET_CURVE,
        payload
    })
}
