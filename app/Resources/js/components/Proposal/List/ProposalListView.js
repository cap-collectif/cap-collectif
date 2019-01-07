// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import type { ProposalListView_step } from './__generated__/ProposalListView_step.graphql';
import type { ProposalListView_viewer } from './__generated__/ProposalListView_viewer.graphql';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '../../../types';
import ProposalListViewPaginated from './ProposalListViewPaginated';
import { graphqlError } from '../../../createRelayEnvironment';

type Filters = {|
  categories?: string,
  districts?: string,
  themes?: string,
  types?: string,
  statuses?: string,
|};

export const queryVariables = (filters: Filters, order: ?string) => {
  let field = 'RANDOM';
  let direction = 'ASC';

  switch (order) {
    case 'least-votes':
      direction = 'ASC';
      field = 'VOTES';
      break;
    case 'votes':
      direction = 'DESC';
      field = 'VOTES';
      break;
    case 'old':
      direction = 'ASC';
      field = 'PUBLISHED_AT';
      break;
    case 'last':
      direction = 'DESC';
      field = 'PUBLISHED_AT';
      break;
    case 'comments':
      direction = 'ASC';
      field = 'COMMENTS';
      break;
    case 'cheap':
      direction = 'ASC';
      field = 'COST';
      break;
    case 'expensive':
      direction = 'DESC';
      field = 'COST';
      break;
    default:
      break;
  }

  return {
    orderBy: { field, direction },
    district: filters.districts && filters.districts !== '0' ? filters.districts : null,
    theme: filters.themes && filters.themes !== '0' ? filters.themes : null,
    category: filters.categories && filters.categories !== '0' ? filters.categories : null,
    userType: filters.types && filters.types !== '0' ? filters.types : null,
    status: filters.statuses && filters.statuses !== '0' ? filters.statuses : null,
  };
};

type Props = {
  filters: Filters,
  term: ?string,
  order: string,
  relay: RelayRefetchProp,
  step: ProposalListView_step,
  viewer: ?ProposalListView_viewer,
  visible: boolean,
  view: 'mosaic' | 'table',
};
type State = {
  isRefetching: boolean,
};

export class ProposalListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
    hasRefetchError: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.order !== this.props.order ||
      prevProps.filters !== this.props.filters ||
      prevProps.term !== this.props.term
    ) {
      this._refetch();
    }
  }

  _refetch = () => {
    this.setState({ isRefetching: true, hasRefetchError: false });

    const refetchVariables = fragmentVariables => ({
      ...queryVariables(this.props.filters, this.props.order),
      stepId: this.props.step.id,
      isAuthenticated: !!this.props.viewer,
      count: fragmentVariables.count,
      term: this.props.term || null,
    });

    this.props.relay.refetch(
      refetchVariables,
      null,
      (error: ?Error) => {
        if (error) {
          this.setState({ hasRefetchError: true });
        }
        this.setState({ isRefetching: false });
      },
      { force: true },
    );
  };

  render() {
    const { visible, step, viewer, view } = this.props;

    if (!visible) {
      return null;
    }

    if (this.state.hasRefetchError) {
      return graphqlError;
    }

    if (this.state.isRefetching) {
      return <Loader />;
    }

    // $FlowFixMe
    return <ProposalListViewPaginated step={step} viewer={viewer} view={view} />;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  filters: state.proposal.filters || {},
  term: state.proposal.terms,
  order: state.proposal.order,
});

const container = connect(mapStateToProps)(ProposalListView);

export default createRefetchContainer(
  container,
  {
    viewer: graphql`
      fragment ProposalListView_viewer on User {
        ...ProposalListViewPaginated_viewer
      }
    `,
    step: graphql`
      fragment ProposalListView_step on ProposalStep @argumentDefinitions(count: { type: "Int" }) {
        id
        ...ProposalListViewPaginated_step
      }
    `,
  },
  graphql`
    query ProposalListViewRefetchQuery(
      $stepId: ID!
      $cursor: String
      $orderBy: ProposalOrder
      $isAuthenticated: Boolean!
      $count: Int
      $term: String
      $district: ID
      $category: ID
      $status: ID
      $theme: ID
      $userType: ID
    ) {
      step: node(id: $stepId) {
        id
        ...ProposalListView_step
        ...ProposalStepPageHeader_step
      }
    }
  `,
);
