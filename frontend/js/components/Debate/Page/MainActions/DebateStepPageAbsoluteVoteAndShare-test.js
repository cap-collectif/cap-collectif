// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import * as hooks from '@xstate/react/lib/useActor';
import DebateStepPageAbsoluteVoteAndShare from './DebateStepPageAbsoluteVoteAndShare';
import type { DebateStepPageAbsoluteVoteAndShareTestQuery } from '~relay/DebateStepPageAbsoluteVoteAndShareTestQuery.graphql';
import {
  MockProviders,
  RelaySuspensFragmentTest,
  addsSupportForPortals,
  clearSupportForPortals,
} from '~/testUtils';
import { MachineContext } from './DebateStepPageStateMachine';

describe('<DebateStepPageAbsoluteVoteAndShare />', () => {
  let environment;
  let testComponentTree;
  let MobileTestComponent;
  let DesktopTestComponent;

  const query = graphql`
    query DebateStepPageAbsoluteVoteAndShareTestQuery(
      $id: ID = "<default>"
      $isMobile: Boolean!
      $isAuthenticated: Boolean!
    ) @relay_test_operation {
      step: node(id: $id) {
        ...DebateStepPageAbsoluteVoteAndShare_step
          @arguments(isMobile: $isMobile, isAuthenticated: $isAuthenticated)
      }
    }
  `;

  const defaultMockResolvers = {
    DebateStep: () => ({
      url: '/debate/pour-ou-contre',
    }),
  };

  const Machine = { value: {} };

  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const desktopVariables = { isMobile: false, isAuthenticated: true };
    const mobileVariables = { isMobile: true, isAuthenticated: true };
    const TestRenderer = ({ componentProps, queryVariables }) => {
      const data = useLazyLoadQuery<DebateStepPageAbsoluteVoteAndShareTestQuery>(
        query,
        queryVariables,
      );
      if (!data.step) return null;
      return (
        <DebateStepPageAbsoluteVoteAndShare
          step={data.step}
          {...componentProps}
          viewerIsConfirmed
          setShowArgumentForm={jest.fn()}
        />
      );
    };
    MobileTestComponent = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders store={{}} useCapUIProvider>
          <MachineContext.Provider value={{ ...Machine }}>
            <TestRenderer
              componentProps={componentProps}
              queryVariables={mobileVariables}
              showArgumentForm
            />
          </MachineContext.Provider>
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
    DesktopTestComponent = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders store={{}} useCapUIProvider>
          <MachineContext.Provider value={{ ...Machine }}>
            <TestRenderer componentProps={componentProps} queryVariables={desktopVariables} />
          </MachineContext.Provider>
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('when the query is on desktop', () => {
    it('renders correctly', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'none' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(
        <DesktopTestComponent showArgumentForm={false} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
    it('renders correctly when voted', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'voted' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(<DesktopTestComponent showArgumentForm />);
      expect(testComponentTree).toMatchSnapshot();
    });
    it('renders correctly when argumented', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'argumented' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(
        <DesktopTestComponent showArgumentForm={false} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
  describe('when the query is on mobile', () => {
    it('renders correctly', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'none' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(
        <MobileTestComponent isMobile showArgumentForm={false} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
    it('renders correctly when voted', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'voted' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(
        <MobileTestComponent isMobile showArgumentForm />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
    it('renders correctly when argumented', () => {
      jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'argumented' }, jest.fn()]);
      testComponentTree = ReactTestRenderer.create(
        <MobileTestComponent showArgumentForm={false} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
