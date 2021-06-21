// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import DashboardPage, { DashboardPageQuery } from './DashboardPage';
import Spinner from '~ds/Spinner/Spinner';
import {
  DashboardPageContext,
  useDashboard,
  type Filters,
  type FilterType,
} from './DashboardPage.context';
import { getFieldsFromUrl, updateQueryUrl } from '~/shared/utils/getFieldsFromUrl';

const DEFAULT_FILTERS = {
  startAt: moment('2014-11-08T17:44:56.144').format('MM/DD/YYYY'),
  endAt: moment().format('MM/DD/YYYY'),
  projectId: 'ALL',
};

const DashboardPageQueryContainer = (): React.Node => {
  const url = React.useMemo(() => new URL(window.location.href), []);
  const filtersFromUrl = getFieldsFromUrl<Filters>(url, {
    default: DEFAULT_FILTERS,
    whitelist: ['startAt', 'endAt'],
  });

  const [filters, setFilters] = React.useState<Filters>(filtersFromUrl);
  const contextValue = React.useMemo(
    () => ({
      filters,
      setFilters: (key: FilterType, value: string) => {
        setFilters(currentFilters => {
          const filtersUpdated = { ...currentFilters };
          filtersUpdated[key] = value;
          return filtersUpdated;
        });
        updateQueryUrl(url, key, { value });
      },
    }),
    [filters, url],
  );

  return (
    <DashboardPageContext.Provider value={contextValue}>
      <DashboardPageQueryRender />
    </DashboardPageContext.Provider>
  );
};

const DashboardPageQueryRender = (): React.Node => {
  const [queryReference, loadQuery] = useQueryLoader(DashboardPageQuery);
  const { filters } = useDashboard();
  const prevFilters = React.useRef();

  React.useEffect(() => {
    if (!queryReference || !isEqual(prevFilters.current, filters)) {
      loadQuery({
        filter: {
          startAt: filters.startAt,
          endAt: filters.endAt,
          projectId: filters.projectId === 'ALL' ? null : filters.projectId,
        },
      });
      prevFilters.current = filters;
    }
  }, [filters, loadQuery, queryReference]);

  if (!queryReference) return <Spinner />;

  return <DashboardPage queryReference={queryReference} />;
};

export default DashboardPageQueryContainer;
