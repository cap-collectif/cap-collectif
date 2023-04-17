// @flow
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { ProposalsListTestQuery } from '~relay/ProposalsListTestQuery.graphql';
import MockProviders, { RelaySuspensFragmentTest } from '~/testUtils';
import ProposalsList from './ProposalsList';

describe('<ProposalsList />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestProposalsList: any;

  const defaultMockResolvers = {
    Node: () => ({
      proposals: {
        __id: 'client:VXNlcjp1c2VyMQ==:__ProjectList_projects_connection',
        totalCount: 35,
        edges: [
          {
            node: { id: 'proposal1' },
          },
          {
            node: { id: 'proposal2' },
          },
        ],
      },
    }),
  };

  const query = graphql`
    query ProposalsListTestQuery($count: Int!, $cursor: String) @relay_test_operation {
      voteStep: node(id: "<default>") {
        ... on SelectionStep {
          ...ProposalsList_step @arguments(count: $count, cursor: $cursor)
        }
      }
    }
  `;

  beforeEach(() => {
    environment = createMockEnvironment();

    const TestRenderer = ({ showImages }) => {
      const data = useLazyLoadQuery<ProposalsListTestQuery>(query, { count: 10, cursor: null });
      if (data) {
        return <ProposalsList stepId="<default>" showImages={showImages} />;
      }

      return null;
    };

    TestProposalsList = ({ showImages }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <TestRenderer showImages={showImages} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
  });

  describe('<TestProposalsList />', () => {
    it('should render correctly without images', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      );
      testComponentTree = ReactTestRenderer.create(<TestProposalsList />);
      expect(testComponentTree).toMatchSnapshot();
    });
    it('should render correctly with images', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      );
      testComponentTree = ReactTestRenderer.create(<TestProposalsList showImages />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
