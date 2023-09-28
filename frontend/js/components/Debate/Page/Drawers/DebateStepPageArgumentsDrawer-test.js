// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import MockProviders, {
  RelaySuspensFragmentTest,
  addsSupportForPortals,
  clearSupportForPortals,
} from '~/testUtils';
import type { DebateStepPageArgumentsDrawerTestQuery } from '~relay/DebateStepPageArgumentsDrawerTestQuery.graphql';
import DebateStepPageArgumentsDrawer from './DebateStepPageArgumentsDrawer';

describe('<DebateStepPageArgumentsDrawer />', () => {
  let environment;
  let testComponentTree;
  let TestComponent;
  let onClose;

  const defaultMockResolvers = {
    DebateStep: () => ({
      id: 'debateStep1',
      arguments: {
        totalCount: 10,
      },
      forArguments: {
        totalCount: 7,
      },
      againstArguments: {
        totalCount: 3,
      },
    }),
  };

  global.Math.random = () => 0.5;

  const query = graphql`
    query DebateStepPageArgumentsDrawerTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!)
    @relay_test_operation {
      debate: node(id: $id) {
        ...DebateStepPageArgumentsDrawer_debate @arguments(isAuthenticated: $isAuthenticated)
      }
      viewer {
        ...DebateStepPageArgumentsDrawer_viewer
      }
    }
  `;

  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    onClose = jest.fn();
    const TestRenderer = props => {
      const data = useLazyLoadQuery<DebateStepPageArgumentsDrawerTestQuery>(query, {
        isAuthenticated: true,
      });
      if (!data.debate) return null;
      return <DebateStepPageArgumentsDrawer debate={data.debate} viewer={data.viewer} {...props} />;
    };
    TestComponent = props => (
      <MockProviders store={{}} useCapUIProvider>
        <RelaySuspensFragmentTest environment={environment}>
          <TestRenderer {...props} />
        </RelaySuspensFragmentTest>
      </MockProviders>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  it('should render when open', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('should render nothing when closed', async () => {
    testComponentTree = ReactTestRenderer.create(
      <TestComponent isOpen={false} onClose={onClose} />,
    );
    expect(testComponentTree.toJSON()).toHaveLength(6);
  });
});
