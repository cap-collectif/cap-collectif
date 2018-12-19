// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { ProjectsListQueryResponse } from './__generated__/ProjectsListQuery.graphql';
import { type GlobalState } from '../../../types';
import ProjectListView from './ProjectListView';
import { selector } from './Filters/ProjectListFilters';

type Props = {
  author: ?string,
  orderBy: ?string,
  type?: ?string,
  theme?: ?string,
  status: ?string,
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
      author: props.author,
      theme: props.theme || props.themeId,
      orderBy: props.orderBy,
      type: props.type,
      status: props.status,
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
    const { author, orderBy, type, theme, term, limit, status } = this.initialRenderVars;
    return (
      <div className="flex-wrap">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectsListQuery(
              $author: ID
              $count: Int
              $cursor: String
              $theme: ID
              $orderBy: ProjectOrder
              $type: ID
              $term: String
              $status: ID
            ) {
              ...ProjectListView_query
                @arguments(
                  theme: $theme
                  orderBy: $orderBy
                  author: $author
                  type: $type
                  term: $term
                  status: $status
                  count: $count
                )
            }
          `}
          variables={{
            orderBy: {
              field: orderBy,
              direction: 'ASC',
            },
            author,
            type,
            theme,
            term,
            count: limit,
            status,
          }}
          render={this.renderProjectList}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'LATEST',
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
});

export default connect(mapStateToProps)(ProjectsList);
