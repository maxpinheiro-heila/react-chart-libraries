import { Curve, Page } from "./settings.reducer";
import { AppReducer } from "./store";

export const selectTimeRange = (state: AppReducer.AppState): number => state.settings.timeRange;

export const selectPage = (state: AppReducer.AppState): Page => state.settings.page;

export const selectCurve = (state: AppReducer.AppState): Curve => state.settings.curve;
