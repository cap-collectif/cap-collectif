// @flow
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { VotesListTestQuery } from '~relay/VotesListTestQuery.graphql';
import MockProviders, { RelaySuspensFragmentTest } from '~/testUtils';
import VotesList from './VotesList';

describe('<VotesList />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestVotesList: any;

  const defaultMockResolvers = {
    Node: () => ({
      viewerVotes: {
        __id: 'client:VXNlcjp1c2VyMQ==:__ProjectList_projects_connection',
        totalCount: 2,
        edges: [
          {
            node: { id: 'viewerVote1', proposal: { id: 'proposal1' } },
          },
          {
            node: { id: 'viewerVote2', proposal: { id: 'proposal2' } },
          },
        ],
      },
    }),
  };

  const query = graphql`
    query VotesListTestQuery($count: Int!, $cursor: String) @relay_test_operation {
      voteStep: node(id: "<default>") {
        ... on SelectionStep {
          ...VotesList_step @arguments(count: $count, cursor: $cursor)
        }
      }
    }
  `;

  beforeEach(() => {
    environment = createMockEnvironment();

    const TestRenderer = () => {
      const data = useLazyLoadQuery<VotesListTestQuery>(query, { count: 10, cursor: null });
      if (data) {
        return <VotesList stepId="<default>" />;
      }

      return null;
    };

    TestVotesList = ({ showImages }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <TestRenderer showImages={showImages} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
  });

  describe('<TestVotesList />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      );
      testComponentTree = ReactTestRenderer.create(<TestVotesList />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
