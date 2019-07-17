// @flow
import React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { ProjectsListQueryResponse } from '~relay/ProjectsListQuery.graphql';
import { type GlobalState } from '../../../types';
import ProjectListView from './ProjectListView';
import { getInitialValues } from './Filters/ProjectListFilters';

type Props = {|
  authorId?: string,
  orderBy: ?string,
  term?: ?string,
  // Used only on /themes page
  themeId: ?string,
  // Default props not working
  orderBy?: ?string,
  // Defined pagination limit
  limit: number,
  // Should we allow pagination ?
  paginate: boolean,
|};

class ProjectsList extends React.Component<Props> {
  initialRenderVars = {};

  static defaultProps = {
    limit: 50,
    paginate: true,
    themeId: null,
  };

  constructor(props: Props) {
    super(props);

    this.initialRenderVars = {
      ...getInitialValues(),
      orderBy: props.orderBy,
      term: props.term,
      limit: props.limit,
      author: props.authorId,
    };
    if (props.themeId) {
      this.initialRenderVars.theme = props.themeId;
    }
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
    const { orderBy, type, theme, term, limit, status, author } = this.initialRenderVars;

    return (
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
          type,
          term,
          theme,
          status,
          author,
          count: limit,
          orderBy: {
            field: orderBy,
            direction: 'DESC',
          },
        }}
        render={this.renderProjectList}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'LATEST',
});

export default connect(mapStateToProps)(ProjectsList);
