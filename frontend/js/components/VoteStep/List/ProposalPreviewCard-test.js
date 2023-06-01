// @flow
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { ProposalPreviewCardTestQuery } from '~relay/ProposalPreviewCardTestQuery.graphql';
import MockProviders, { RelaySuspensFragmentTest } from '~/testUtils';
import ProposalPreviewCard from './ProposalPreviewCard';

describe('<ProposalPreviewCard />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestProposalPreviewCard: any;

  const query = graphql`
    query ProposalPreviewCardTestQuery($id: ID = "<default>") @relay_test_operation {
      proposal: node(id: $id) {
        ... on Proposal {
          ...ProposalPreviewCard_proposal @arguments(stepId: "<stepId>")
        }
      }
    }
  `;

  beforeEach(() => {
    environment = createMockEnvironment();

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProposalPreviewCardTestQuery>(query, {});
      if (data) {
        return (
          <ProposalPreviewCard
            proposal={data.proposal}
            hasVoted={false}
            stepId="<stepId>"
            disabled={false}
          />
        );
      }

      return null;
    };

    TestProposalPreviewCard = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <TestRenderer />
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
  });

  describe('<TestProposalPreviewCard />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Node: () => ({
            title:
              "Installation d'une serre dans le Jardin partagé du Val des Oiseaux - Argenteuil",
            url: 'installation-serre-jardin-argenteuil',
            summaryOrBodyExcerpt: 'En accord avec la municipalité...',
            author: {
              displayName: 'Jane Doe',
              media: {
                url: 'profile-pic.jpg',
              },
            },
            district: {
              name: 'Argenteuil',
            },
            category: {
              name: 'Ecologie',
              color: 'green',
              icon: 'ecology-leaf',
            },
            media: {
              url: 'image-de-jardin.png',
              name: 'jardin',
            },
            comments: {
              totalCount: 50,
            },
            votes: {
              totalCount: 400,
            },
            status: {
              name: 'En cours',
            },
          }),
        }),
      );
      testComponentTree = ReactTestRenderer.create(<TestProposalPreviewCard />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
