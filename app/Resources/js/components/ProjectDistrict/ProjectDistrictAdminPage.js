// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProjectDistrictsList from './ProjectDistrictsList';
import type { ProjectDistrictAdminPageQueryResponse } from './__generated__/ProjectDistrictAdminPageQuery.graphql';

type Props = {};

export class ProjectDistrictAdminPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectDistrictAdminPageQuery {
            districts: projectDistricts {
              ...ProjectDistrictsList_districts
            }
          }
        `}
        variables={{}}
        render={({
          error,
          props,
        }: { props: ?ProjectDistrictAdminPageQueryResponse } & ReadyState) => {
          if (error) {
            return graphqlError;
          }

          if (!props) {
            return <Loader />;
          }

          return (
            <div className="box box-primary container-fluid pb-15">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.districts" />
              </h3>
              <hr />
              {/* $FlowFixMe */}
              <ProjectDistrictsList districts={props.districts} />
            </div>
          );
        }}
      />
    );
  }
}

export default ProjectDistrictAdminPage;
