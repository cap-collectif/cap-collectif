// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { ProjectsListQueryResponse } from './__generated__/ProjectsListQuery.graphql';
import { type GlobalState } from '../../../types';
import ProjectListView from './ProjectListView';

const renderProjectList = ({
  error,
  props,
}: {
  props: ?ProjectsListQueryResponse,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    return <ProjectListView query={props} />;
  }
  return <Loader />;
};

type Props = {
  orderBy: ?string,
  type: ?string,
  theme: ?string,
  term: ?string,
  limit?: ?number,
};

class ProjectsList extends React.Component<Props> {
  initialRenderVars = {};

  constructor(props: Props) {
    super(props);
    this.initialRenderVars = {
      theme: props.theme,
      orderBy: props.orderBy,
      type: props.type,
      term: props.term,
      limit: props.limit,
    };
  }

  render() {
    const { orderBy, type, theme, term, limit } = this.initialRenderVars;
    console.log('this.props ******************');
    console.log(this.props);
    return (
      <div className="flex-wrap">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectsListQuery(
              $count: Int
              $cursor: String
              $theme: ID
              $orderBy: ProjectOrder
              $type: ID
              $term: String
              $limit: Int
            ) {
              ...ProjectListView_query
                @arguments(
                  theme: $theme
                  orderBy: $orderBy
                  type: $type
                  term: $term
                  limit: $limit
                )
            }
          `}
          variables={{
            orderBy: {
              field: orderBy,
              direction: 'ASC',
            },
            type,
            theme,
            term,
            limit,
          }}
          render={renderProjectList}
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  theme: state.project.theme,
  orderBy: state.project.orderBy || 'LATEST',
  type: state.project.type,
  term: state.project.term,
});

export default connect(mapStateToProps)(ProjectsList);
