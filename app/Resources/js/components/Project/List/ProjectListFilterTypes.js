// @flow
import React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormControl } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { ProjectListFilterTypesQueryResponse } from './__generated__/ProjectListFilterTypesQuery.graphql';
import { changeType } from '../../../redux/modules/project';

type Props = {
  dispatch: Function,
  intl: Object,
  type: ?string,
};

export default class ProjectsListFilterTypes extends React.Component<Props> {
  renderProjectsListFilterTypes = ({
    error,
    props,
  }: {
    props: ?ProjectListFilterTypesQueryResponse,
  } & ReadyState) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (props) {
      if (props.projectTypes) {
        const { dispatch, intl, type } = this.props;
        const { projectTypes } = props;
        if (projectTypes.length > 0) {
          return (
            <FormControl
              id="project-type"
              componentClass="select"
              type="select"
              name="type"
              value={type}
              onChange={e => {
                dispatch(changeType(e.target.value));
              }}>
              <option key="all" value="">
                {intl.formatMessage({ id: 'global.select_project_types' })}
              </option>
              {projectTypes.map(projectType => (
                <FormattedMessage id={projectType.title} key={projectType.slug}>
                  {message => <option value={projectType.id}>{message}</option>}
                </FormattedMessage>
              ))}
            </FormControl>
          );
        }
      }
    }
    return null;
  };

  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ProjectListFilterTypesQuery {
            projectTypes {
              id
              title
              slug
            }
          }
        `}
        variables={{}}
        render={this.renderProjectsListFilterTypes}
      />
    );
  }
}
