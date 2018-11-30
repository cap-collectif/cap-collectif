// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProjectDistrictsList from './ProjectDistrictsList';

type Props = {};

export class ProjectDistrictPage extends React.Component<Props> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectDistrictPageQuery {
            districts: projectDistricts {
              ...ProjectDistrictsList_districts
            }
          }
        `}
        variables={{}}
        render={({ error, props }) => {
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

export default ProjectDistrictPage;
