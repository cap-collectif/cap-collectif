import * as React from 'react';
import moment from 'moment';

export enum FilterKey {
    PROJECT = 'projectId',
    START_AT = 'startAt',
    END_AT = 'endAt',
}

export type DateRange = {
    [FilterKey.START_AT]: string,
    [FilterKey.END_AT]: string,
};

export type Filters = {
    dateRange: DateRange,
    [FilterKey.PROJECT]: string,
};

export const DEFAULT_FILTERS = {
    dateRange: {
        startAt: moment().subtract(3, 'years').format('MM/DD/YYYY'),
        endAt: moment().format('MM/DD/YYYY'),
    },
    projectId: 'ALL',
};

export type Context = {
    filters: Filters,
    setFilters: (key: FilterKey, value: string) => void,
};

export const DashboardContext: React.Context<Context> = React.createContext<Context>({
    filters: {
        dateRange: {
            startAt: DEFAULT_FILTERS.dateRange.startAt,
            endAt: DEFAULT_FILTERS.dateRange.endAt,
        },
        projectId: 'ALL',
    },
    setFilters: () => {},
});

export const useDashboard = (): Context => {
    const context = React.useContext(DashboardContext);
    if (!context) {
        throw new Error(
            `You can't use the useDashboardContext outside a DashboardContext component.`,
        );
    }
    return context;
};
