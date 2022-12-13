// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { EventPageProjectListTestQuery } from '~relay/EventPageProjectListTestQuery.graphql';
import EventPageProjectList from './EventPageProjectList';

describe('<EventPageProjectList />', () => {
  let environment;
  let testComponentTree;
  let TestEventPageProjectList;

  const query = graphql`
    query EventPageProjectListTestQuery($id: ID!) @relay_test_operation {
      event: node(id: $id) {
        ... on Event {
          ...EventPageProjectList_event
        }
      }
    }
  `;

  const defaultMockResolvers = {
    Event: () => ({
      projects: [
        {
          id: 'UHJvamVjdDpwcm9qZWN0MQ==',
          title: 'Croissance, innovation, disruption',
          type: {
            title: 'project.types.interpellation',
            color: '#5cb85c',
          },
          themes: [
            {
              title: 'Immobilier',
            },
            {
              title: 'Justice',
            },
          ],
          cover: {
            url: 'https://capco.dev/media/default/0001/01/providerReference1.jpg',
          },
          isExternal: false,
          externalLink: null,
          url: 'https://capco.dev/project/croissance-innovation-disruption/presentation/presentation-1',
          isVotesCounterDisplayable: true,
          isContributionsCounterDisplayable: true,
          isParticipantsCounterDisplayable: true,
          archived: false,
          votes: {
            totalCount: 10,
          },
          anonymousVotes: {
            totalCount: 0,
          },
          contributions: {
            totalCount: 264,
          },
          contributors: {
            totalCount: 41,
          },
          anonymousReplies: {
            totalCount: 0,
          },
          hasParticipativeStep: true,
          externalParticipantsCount: null,
          externalContributionsCount: null,
          externalVotesCount: null,
          districts: {
            totalCount: 2,
            edges: [
              {
                node: {
                  name: 'Premier Quartier',
                },
              },
              {
                node: {
                  name: 'Deuxième Quartier',
                },
              },
            ],
          },
          visibility: 'PUBLIC',
          publishedAt: '2014-12-31 00:00:00',
          steps: [
            {
              state: 'CLOSED',
              __typename: 'PresentationStep',
            },
            {
              state: 'OPENED',
              __typename: 'ConsultationStep',
            },
            {
              state: 'CLOSED',
              __typename: 'OtherStep',
            },
            {
              state: 'CLOSED',
              __typename: 'RankingStep',
            },
          ],
          currentStep: {
            id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=',
            timeless: false,
            state: 'OPENED',
            timeRange: {
              endAt: '2032-11-01 00:00:00',
            },
          },
        },
      ],
      steps: [
        {
          url: 'https://capco.dev/project/croissance-innovation-disruption/step/proposition',
        },
      ],
    }),
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const queryVariables = { id: 'id' };

    const TestRenderer = ({ queryVariables: variables }) => {
      const data = useLazyLoadQuery<EventPageProjectListTestQuery>(query, variables);
      if (!data || !data.event) return null;
      return <EventPageProjectList eventRef={data.event} />;
    };

    TestEventPageProjectList = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestEventPageProjectList />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestEventPageProjectList />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
