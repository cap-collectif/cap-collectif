// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { ProposalListViewPaginated_step } from '~relay/ProposalListViewPaginated_step.graphql';
import type { ProposalListViewPaginated_viewer } from '~relay/ProposalListViewPaginated_viewer.graphql';
import VisibilityBox from '../../Utils/VisibilityBox';
import ProposalList from './ProposalList';
import type { ProposalViewMode } from '~/redux/modules/proposal';
import ProposalsDisplayMap from '../../Page/ProposalsDisplayMap';
import type { MapOptions } from '../Map/Map.types';
import type { GeoJson } from '~/utils/geojson';

type Props = {
  relay: RelayPaginationProp,
  displayMap: boolean,
  step: ProposalListViewPaginated_step,
  displayMode: ProposalViewMode,
  defaultMapOptions: MapOptions,
  geoJsons: Array<GeoJson>,
  viewer: ?ProposalListViewPaginated_viewer,
  count: number,
};

const ProposalListViewPaginated = ({
  step,
  viewer,
  geoJsons,
  defaultMapOptions,
  displayMap,
  relay,
  displayMode,
  count,
}: Props) => {
  const [loading, setLoading] = React.useState<boolean>(false);

  return (
    <div
      className={cn('proposal-list-view-paginated', {
        [`displayMode-${displayMode}`]: !!displayMode,
      })}>
      {displayMap && displayMode === 'MAP' ? (
        <ProposalsDisplayMap
          className="zi-0"
          step={step}
          geoJsons={geoJsons}
          defaultMapOptions={defaultMapOptions}
        />
      ) : (
        <React.Fragment>
          <VisibilityBox enabled={step.private || false}>
            <ProposalList
              step={step}
              proposals={step.proposals}
              viewer={viewer}
              view={displayMode}
              id="proposals-list"
            />
          </VisibilityBox>
          <div id="proposal-list-pagination-footer" className="text-center">
            {relay.hasMore() && (
              <Button
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  relay.loadMore(count, () => {
                    setLoading(false);
                  });
                }}>
                <FormattedMessage id={loading ? 'global.loading' : 'see-more-proposals'} />
              </Button>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const ProposalListViewPaginatedRelay = createPaginationContainer(
  ProposalListViewPaginated,
  {
    viewer: graphql`
      fragment ProposalListViewPaginated_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
        ...ProposalList_viewer @arguments(stepId: $stepId)
      }
    `,
    step: graphql`
      fragment ProposalListViewPaginated_step on ProposalStep {
        id
        ... on CollectStep {
          private
        }
        ...ProposalsDisplayMap_step
        ...ProposalList_step
        proposals(
          first: $count
          after: $cursor
          orderBy: $orderBy
          term: $term
          district: $district
          theme: $theme
          category: $category
          status: $status
          userType: $userType
        ) @connection(key: "ProposalListViewPaginated_proposals", filters: []) {
          ...ProposalList_proposals
          edges {
            node {
              id
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.step && props.step.proposals;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        stepId: props.step.id,
        isAuthenticated: !!props.viewer,
      };
    },
    query: graphql`
      query ProposalListViewPaginatedQuery(
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
          ...ProposalListViewPaginated_step
          ...ProposalStepPageHeader_step
        }
      }
    `,
  },
);

export default ProposalListViewPaginatedRelay;
