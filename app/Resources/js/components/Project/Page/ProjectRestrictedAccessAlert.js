// @flow
import React from 'react';
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';

const query = graphql`
  query ProjectRestrictedAccessAlertQuery($id: ID!) {
    project: node(id: $id) {
      ... on Project {
        visibility
        adminUrl
      }
    }
  }
`;

type Props = {
  projectId: string,
  project: Object,
};

export class ProjectRestrictedAccessAlert extends React.Component<Props> {
  render() {
    const rendering = ({ props, error }) => {
      if (error) {
        return graphqlError;
      }
      if (props) {
        if (props.project.visibility !== 'PUBLIC') {
          const alertText =
            props.project.visibility === 'ME'
              ? 'global.draft.only_visible_by_you'
              : 'only-visible-by-administrators';
          return (
            <Alert
              className="alert-dismissible text-center"
              bsStyle="warning"
              style={{ marginBottom: '0', textAlign: 'center' }}>
              <i className="cap cap-lock-2 mr-1" />
              <FormattedMessage id={alertText} />
              <a
                id="action_show"
                className="ml-15 btn btn-sm btn-warning"
                href={props.project.adminUrl}
                name="action_edit">
                <FormattedMessage id="action_edit" />
                <i className="cap cap-external-link ml-5" />
              </a>
            </Alert>
          );
        }
      }
      return null;
    };
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={{
            id: this.props.projectId,
          }}
          render={rendering}
        />
      </div>
    );
  }
}

export default ProjectRestrictedAccessAlert;
