// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer from 'react-test-renderer';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import { StepPageHeader } from './StepPageHeader';
import type { StepPageHeaderTestQuery } from '~relay/StepPageHeaderTestQuery.graphql';

describe('<StepPageHeader />', () => {
  let environment;
  let testComponentTree;
  let TestStepPageHeader;

  const defaultMockResolvers = {
    Step: () => ({
      title: 'I am a title',
      body: null,
      timeRange: {
        startAt: null,
        endAt: null,
      },
      state: 'OPENED',
      timeless: false,
      __typename: 'ConsultationStep',
    }),
  };

  const query = graphql`
    query StepPageHeaderTestQuery($stepId: ID = "stepId") @relay_test_operation {
      step: node(id: $stepId) {
        ...StepPageHeader_step
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
      const data = useLazyLoadQuery<StepPageHeaderTestQuery>(query, {});
      if (!data.step) return null;
      return <StepPageHeader step={data.step} {...props} />;
    };
    TestStepPageHeader = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  it('should render correctly a consultationStep', () => {
    testComponentTree = ReactTestRenderer.create(<TestStepPageHeader />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render correctly a consultationStep with a description', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Step: () => ({
          ...defaultMockResolvers.Step(),
          body: 'Je suis la belle description',
        }),
      }),
    );
    testComponentTree = ReactTestRenderer.create(<TestStepPageHeader />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render correctly a selectionStep', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Step: () => ({
          ...defaultMockResolvers.Step(),
          __typename: 'SelectionStep',
          voteThreshold: 1,
          votable: true,
        }),
      }),
    );
    testComponentTree = ReactTestRenderer.create(<TestStepPageHeader />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render correctly a selectionStep with interpellation', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Step: () => ({
          ...defaultMockResolvers.Step(),
          __typename: 'SelectionStep',
          voteThreshold: 1,
          votable: true,
          form: {
            objectType: 'PROPOSAL',
          },
          project: {
            type: {
              title: 'project.types.interpellation',
            },
          },
        }),
      }),
    );
    testComponentTree = ReactTestRenderer.create(<TestStepPageHeader />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render correctly a questionnaireStep', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Step: () => ({
          ...defaultMockResolvers.Step(),
          __typename: 'QuestionnaireStep',
        }),
      }),
    );
    testComponentTree = ReactTestRenderer.create(<TestStepPageHeader />);
    expect(testComponentTree).toMatchSnapshot();
  });
});
