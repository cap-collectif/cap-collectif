// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ProjectHeaderBlocks from '~/components/Project/ProjectHeaderBlocks';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ProjectHeaderBlocksTestQuery } from '~relay/ProjectHeaderBlocksTestQuery.graphql';

describe('<ProjectHeaderBlocks />', () => {
  let environment;
  let TestComponent;

  const oneStepProject = {
    isVotesCounterDisplayable: true,
    isContributionsCounterDisplayable: true,
    isParticipantsCounterDisplayable: true,
    steps: [
      {
        timeRange: {
          remainingTime: {
            days: 1240,
          },
        },
      },
    ],
    contributions: {
      totalCount: 0,
    },
    contributors: {
      totalCount: 0,
    },
    votes: {
      totalCount: 0,
    },
  };

  const defaultMockResolvers = {
    Project: () => ({
      isVotesCounterDisplayable: true,
      isContributionsCounterDisplayable: true,
      isParticipantsCounterDisplayable: true,
      steps: [
        {
          timeRange: {
            remainingTime: {
              days: 3236,
            },
          },
        },
        {
          timeRange: {
            remainingTime: {
              days: 4199,
            },
          },
        },
        {
          timeRange: {
            remainingTime: {
              days: 4106,
            },
          },
        },
        {
          timeRange: {
            remainingTime: {
              days: 13267,
            },
          },
        },
      ],
      contributions: {
        totalCount: 16,
      },
      contributors: {
        totalCount: 4,
      },
      votes: {
        totalCount: 5,
      },
    }),
  };
  const query = graphql`
    query ProjectHeaderBlocksTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderBlocks_project
      }
    }
  `;
  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProjectHeaderBlocksTestQuery>(query, {});
      if (!data.project) return null;
      return <ProjectHeaderBlocks project={data.project} {...props} />;
    };
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with one Step', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          ...oneStepProject,
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly without voter count', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          ...defaultMockResolvers.Project(),
          isVotesCounterDisplayable: false,
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
