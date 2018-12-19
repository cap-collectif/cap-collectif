// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { ProjectsListQueryResponse } from './__generated__/ProjectsListQuery.graphql';
import { type GlobalState } from '../../../types';
import ProjectListView from './ProjectListView';

type Props = {
  type?: ?string,
  theme?: ?string,
  // Used only on /themes page
  themeId?: ?string,
  term?: ?string,
  // Default props not working
  orderBy?: ?string,
  limit?: ?number,
  paginate?: ?boolean,
};

class ProjectsList extends React.Component<Props> {
  initialRenderVars = {};

  static defaultProps = {
    limit: 50,
    paginate: true,
  };

  constructor(props: Props) {
    super(props);
    this.initialRenderVars = {
      theme: props.theme || props.themeId,
      orderBy: props.orderBy,
      type: props.type,
      term: props.term,
      limit: props.limit,
    };
  }

  renderProjectList = ({
    error,
    props,
  }: {
    props: ?ProjectsListQueryResponse,
  } & ReadyState) => {
    const { limit, paginate } = this.props;
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (props) {
      return <ProjectListView query={props} limit={limit} paginate={paginate} />;
    }
    return <Loader />;
  };

  render() {
    const { orderBy, type, theme, term, limit } = this.initialRenderVars;
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
            ) {
              ...ProjectListView_query
                @arguments(
                  theme: $theme
                  orderBy: $orderBy
                  type: $type
                  term: $term
                  count: $count
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
            count: limit,
          }}
          render={this.renderProjectList}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  theme: state.project.theme,
  orderBy: state.project.orderBy || 'LATEST',
  type: state.project.type,
  term: state.project.term,
});

export default connect(mapStateToProps)(ProjectsList);
