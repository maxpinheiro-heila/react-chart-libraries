import { Curve } from "../store/settings.reducer";

export const CHART_WIDTH = 462;
export const CHART_HEIGHT = 300;
export const MAX_READS = 300;
export const Y_MIN = -100; // watts
export const Y_MAX = 1100;
export const timeRangeOptions: ({name: string, value: number})[] = [
    {
        name: 'Last 10s',
        value: 10,
    },
    {
        name: 'Last 30s',
        value: 30
    },
    {
        name: 'Last 1m',
        value: 60
    },
    {
        name: 'Last 2m',
        value: 120
    },
    {
        name: 'Last 5m',
        value: 300
    },
    {
        name: 'Last 30m',
        value: 1800
    },
    {
        name: 'Last 1h',
        value: 3600
    },
    {
        name: 'Last 2h',
        value: 7200
    },
    {
        name: 'Last 5h',
        value: 18000
    }
  ]

  export const curveTypes: Curve[] = ['basis', 'monotone', 'natural'];