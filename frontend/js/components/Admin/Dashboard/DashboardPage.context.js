// @flow
import * as React from 'react';
import moment from 'moment';

export type FilterType = 'startAt' | 'endAt' | 'projectId';

export type Filters = {|
  +startAt: string,
  +endAt: string,
  +projectId: string,
|};

export type Context = {|
  +filters: Filters,
  +setFilters: (key: FilterType, value: string) => void,
|};

export const DashboardPageContext: React.Context<Context> = React.createContext<Context>({
  filters: {
    startAt: moment('2014-11-08T17:44:56.144').format('MM/DD/YYYY'),
    endAt: moment().format('MM/DD/YYYY'),
    projectId: 'ALL',
  },
  setFilters: () => {},
});

export const useDashboard = (): Context => {
  const context = React.useContext(DashboardPageContext);
  if (!context) {
    throw new Error(
      `You can't use the useDashboardContext outsides a DashboardPageContext component.`,
    );
  }
  return context;
};
