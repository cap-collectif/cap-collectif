import * as React from 'react';
import moment from 'moment';

export enum FilterKey {
    DATE_RANGE = 'dateRange',
    PROJECT = 'projectId',
}

export type DateRange = {
    startAt: string,
    endAt: string,
};

export type Filters = {
    [FilterKey.DATE_RANGE]: DateRange,
    [FilterKey.PROJECT]: string,
};

export const DEFAULT_FILTERS = {
    dateRange: {
        startAt: moment().subtract(1, 'months').format('MM/DD/YYYY'),
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
