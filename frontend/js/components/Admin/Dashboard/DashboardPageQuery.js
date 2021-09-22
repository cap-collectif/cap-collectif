// @flow
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryLoader } from 'react-relay';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import DashboardPage, { DashboardPageQuery } from './DashboardPage';
import {
  DashboardPageContext,
  useDashboard,
  type Filters,
  type FilterType,
} from './DashboardPage.context';
import { getFieldsFromUrl, updateQueryUrl } from '~/shared/utils/getFieldsFromUrl';
import DashboardError from './DashboardError/DashboardError';

const DEFAULT_FILTERS = {
  startAt: moment()
    .subtract(1, 'years')
    .format('MM/DD/YYYY'),
  endAt: moment().format('MM/DD/YYYY'),
  projectId: 'ALL',
};

type Props = {|
  +isAdmin: boolean
|}

const DashboardPageQueryContainer = ({ isAdmin }: Props): React.Node => {
  const url = React.useMemo(() => new URL(window.location.href), []);
  const filtersFromUrl = getFieldsFromUrl<Filters>(url, {
    default: DEFAULT_FILTERS,
    whitelist: ['startAt', 'endAt'],
  });

  const [filters, setFilters] = React.useState<Filters>(filtersFromUrl);
  const contextValue = React.useMemo(
    () => ({
      isAdmin,
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
    [filters, url, isAdmin],
  );

  return (
    <DashboardPageContext.Provider value={contextValue}>
      <DashboardPageQueryRender />
    </DashboardPageContext.Provider>
  );
};

const DashboardPageQueryRender = (): React.Node => {
  const [queryReference, loadQuery] = useQueryLoader(DashboardPageQuery);
  const { filters, isAdmin } = useDashboard();
  const prevFilters = React.useRef();

  React.useEffect(() => {
    if (!queryReference || !isEqual(prevFilters.current, filters)) {
      loadQuery({
        filter: {
          startAt: filters.startAt,
          endAt: filters.endAt,
          projectId: filters.projectId === 'ALL' ? null : filters.projectId,
        },
        affiliations: isAdmin ? null : ['OWNER'],
        isProjectAdmin: !isAdmin
      });
      prevFilters.current = filters;
    }
  }, [filters, loadQuery, queryReference, isAdmin]);

  return queryReference ? (
    <ErrorBoundary
      FallbackComponent={DashboardError}
      onReset={() => {
        loadQuery({
          filter: {
            startAt: filters.startAt,
            endAt: filters.endAt,
            projectId: filters.projectId === 'ALL' ? null : filters.projectId,
          },
          affiliations: isAdmin ? null : ['OWNER'],
          isProjectAdmin: !isAdmin
        });
      }}>
      <DashboardPage queryReference={queryReference} />
    </ErrorBoundary>
  ) : null;
};

export default DashboardPageQueryContainer;
