import React from "react";
import { DateTime, DateTimeFormatOptions, LocaleOptions } from 'luxon';

export function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
  const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}

export const TimezoneContext = React.createContext('utc');

export const date = (unixUTC: number) => {
  return DateTime.fromMillis(unixUTC, { zone: 'utc' });
};

type inDateType = number | DateTime | string;
type timezoneType = string;

const getDateTime = (inDate: inDateType, timezone: timezoneType): DateTime => {
  const beforeZone = typeof inDate === 'number' ? date(inDate) : (typeof inDate === 'string' ? date(parseInt(inDate)) : inDate);
  return beforeZone.setZone(timezone);
};

const getAsFormat = (inDate: inDateType, timezone: timezoneType, format: string | LocaleOptions & DateTimeFormatOptions) => {
  if (inDate === undefined) return '';
  const dateTime = getDateTime(inDate, timezone);
  if (typeof format === 'string') {
    return dateTime.toFormat(format);
  } else {
    return dateTime.toLocaleString(format);
  }
};

export const getAsTimeWithSeconds = (inDate: inDateType, timezone:timezoneType) => {
  return getAsFormat(inDate, timezone, DateTime.TIME_WITH_SECONDS);
};

export const unixToLocaleTime = (timestamp: number, timezone: string = 'en-us'): string => (new Date(timestamp)).toLocaleTimeString(timezone);

export const formatLatestTime = (seconds: number) => `Last ${(seconds % 60 === 0 ? `${seconds / 60} Minutes` : `${seconds} Seconds`)}`

export enum UnitPrefix {
    Milli = 1000,
    None = 1,
    Kilo = 0.001,
    Mega = 0.000001
}

export interface NumberOptions {
    currentPrefix?: UnitPrefix;
    desiredPrefix?: UnitPrefix;
}
export interface FormatOptions extends NumberOptions {
    units?: string,
    spaceBeforeUnit?: boolean;
    precision?: number;
    max?: number;
    min?: number;
}

export function convert(value: number, options?: NumberOptions): number {
    return value / (options?.currentPrefix?.valueOf() || 1) * (options?.desiredPrefix?.valueOf() || 1);
}

export function forcePrecision(n: number, precision: number): string {
    if (isSimilarFloat(n, 0)) {
        return '0' + (precision > 0 ? '.' : '') + '0'.repeat(precision);
    }

    let nAsString = n.toString();
    let decimal = nAsString.lastIndexOf('.') + 1; // 2
    if (decimal === 0) {
        // no decimal
        nAsString = nAsString.concat('.');
        decimal = nAsString.length;
    }

    const digitsAfterDecimal = nAsString.length - decimal; // 6 - 2 = 4
    if (digitsAfterDecimal > precision) {
        // remove some
        return nAsString.slice(0, nAsString.length - (digitsAfterDecimal - precision));
    } else if (digitsAfterDecimal < precision) {
        // pad with 0s
        return nAsString.concat('0'.repeat(precision - digitsAfterDecimal));
    } else {
        return nAsString;
    }
}

export function clampNumber(num: number, a: number = -Number.MAX_VALUE, b: number = Number.MAX_VALUE) {
  return Math.max(Math.min(forceSmallToZero(num), Math.max(a, b)), Math.min(a, b));
}

export function isSimilarFloat(a: number, b: number) {
  return Math.abs(a - b) <= Number.EPSILON;
}

function forceSmallToZero(n: number) {
  return isSimilarFloat(n, 0) ? 0 : n;
}

export const formatWattsToKilo = (value: number): string => format(value, { desiredPrefix: UnitPrefix.Kilo, units: 'W', precision: 2 });

const DEFAULT_PRECISION = 2;

export function format(value: number | undefined, options?: FormatOptions): string {
    if (value === undefined) {
    return '-';
    }

    const converted = convert(forceSmallToZero(value), options);
    const clamped = clampNumber(converted, options?.min, options?.max);
    return forcePrecision(clamped, options?.precision || DEFAULT_PRECISION)
    + getUnits(options);
}
    export function getUnits(options?: FormatOptions): string {
      return options?.units && options?.units !== ''
        ? (options?.spaceBeforeUnit === undefined || options?.spaceBeforeUnit === true ? ' ' : '')
          + getSIDisplayUnits(options.desiredPrefix || UnitPrefix.None) + options.units
        : '';
    }

    function getSIDisplayUnits(transformUnit: UnitPrefix) {
      switch (transformUnit) {
        case UnitPrefix.Milli:
          return 'm';
        case UnitPrefix.Kilo:
          return 'k';
        case UnitPrefix.Mega:
          return 'M';
        default:
          return '';
      }
    }