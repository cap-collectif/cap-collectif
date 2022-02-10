// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { ListPublicSSO } from './ListPublicSSO';
import {
  addsSupportForPortals,
  disableFeatureFlags,
  enableFeatureFlags,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ListPublicSSOTestQuery } from '~relay/ListPublicSSOTestQuery.graphql';

describe('<ListPublicSSO />', () => {
  let environment;
  let testComponentTree;
  let TestListPublicSSO;

  const query = graphql`
    query ListPublicSSOTestQuery @relay_test_operation {
      ... on Query {
        ...ListPublicSSO_query
      }
    }
  `;

  const defaultMockResolvers = {
    Query: () => ({
      ssoConfigurations: {
        __id: 'aaaa',
        edges: [],
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRender = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ListPublicSSOTestQuery>(query, variables);

      if (data) {
        return <ListPublicSSO query={data} {...componentProps} onToggle={jest.fn()} />;
      }

      return null;
    };

    TestListPublicSSO = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRender componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  afterEach(() => {
    disableFeatureFlags();
    clearSupportForPortals();
  });

  it('renders correctly without France Connect', () => {
    testComponentTree = ReactTestRenderer.create(<TestListPublicSSO />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('renders all element with France Connect', () => {
    enableFeatureFlags(['login_franceconnect']);

    testComponentTree = ReactTestRenderer.create(<TestListPublicSSO />);
    expect(testComponentTree).toMatchSnapshot();
  });
});
