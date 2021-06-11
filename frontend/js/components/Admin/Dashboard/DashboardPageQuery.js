// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import moment from 'moment';
import DashboardPage, { DashboardPageQuery } from './DashboardPage';
import Spinner from '~ds/Spinner/Spinner';

const DashboardPageQueryRender = (): React.Node => {
  const [queryReference, loadQuery] = useQueryLoader(DashboardPageQuery);

  React.useEffect(() => {
    if (!queryReference) {
      loadQuery({
        filter: {
          startAt: moment('2000-11-08T17:44:56.144'),
          endAt: moment().add(7, 'y'),
          projectId: null,
        },
      });
    }
  }, [loadQuery, queryReference]);

  if (!queryReference) return <Spinner />;

  return <DashboardPage queryReference={queryReference} />;
};

export default DashboardPageQueryRender;
