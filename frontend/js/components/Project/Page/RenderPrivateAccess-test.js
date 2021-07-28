// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer from 'react-test-renderer';
import RenderPrivateAccess from './RenderPrivateAccess';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { RenderPrivateAccessTestQuery } from '~relay/RenderPrivateAccessTestQuery.graphql';

describe('<RenderPrivateAccess />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    Project: () => ({
      visibility: 'ME',
    }),
  };

  const query = graphql`
    query RenderPrivateAccessTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...RenderPrivateAccess_project
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
      const data = useLazyLoadQuery<RenderPrivateAccessTestQuery>(query, {});
      if (!data.project) return null;
      return <RenderPrivateAccess project={data.project} {...props} />;
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

  it('should render correctly for me only', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly for admin only', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          visibility: 'ADMIN',
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
