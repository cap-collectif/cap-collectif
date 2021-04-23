// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { DebateStepPageNotYetStartedTestQuery } from '~relay/DebateStepPageNotYetStartedTestQuery.graphql';
import DebateStepPageNotYetStarted from './DebateStepPageNotYetStarted';

describe('<DebateStepPageNotYetStarted />', () => {
  let environment;
  let testComponentTree;
  let TestComponent;

  const query = graphql`
    query DebateStepPageNotYetStartedTestQuery($id: ID = "<default>") @relay_test_operation {
      step: node(id: $id) {
        ...DebateStepPageNotYetStarted_step
      }
    }
  `;

  beforeEach(() => {
    environment = createMockEnvironment();
    const TestRenderer = () => {
      const data = useLazyLoadQuery<DebateStepPageNotYetStartedTestQuery>(query, {});
      if (!data.step) return null;
      return <DebateStepPageNotYetStarted step={data.step} />;
    };
    TestComponent = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer />
      </RelaySuspensFragmentTest>
    );
  });

  it('should render when step is future', async () => {
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const openStepMockResolvers = {
      DebateStep: () => ({
        timeRange: {
          startAt: '2020-02-01 00:03:00',
        },
      }),
    };
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, openStepMockResolvers),
    );

    testComponentTree = ReactTestRenderer.create(<TestComponent />);
    expect(testComponentTree).toMatchSnapshot();
  });
});
