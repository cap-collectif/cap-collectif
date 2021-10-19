// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer from 'react-test-renderer';
import ListSSOConfiguration from './ListSSOConfiguration';
import { $refType } from '~/mocks';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ListSSOConfigurationTestQuery } from '~relay/ListSSOConfigurationTestQuery.graphql';

describe('<ListSSOConfiguration />', () => {
  let environment;
  let testComponentTree;
  let TestListSSOConfigurationSuperAdmin;
  let TestListSSOConfiguration;

  const query = graphql`
    query ListSSOConfigurationTestQuery @relay_test_operation {
      ...ListSSOConfiguration_query
    }
  `;

  const defaultMockResolvers = {
    Query: () => ({
      ssoConfigurations: {
        edges: [
          {
            node: {
              __typename: 'FacebookSSOConfiguration',
              id: 'franceConnect',
              name: 'franceConnect',
              clientId: 'clientId',
              secret: 'SecretKey',
              authorizationUrl: 'https://localhost:8888/authorization',
              accessTokenUrl: 'https://localhost:8888/token',
              userInfoUrl: 'https://localhost:8888/user',
              logoutUrl: 'https://localhost:8888/logout',
            },
          },
          {
            node: {
              __typename: 'Oauth2SSOConfiguration',
              id: 'Oauth2',
              name: 'Oauth2',
              clientId: 'clientId',
              secret: 'SecretKey',
              authorizationUrl: 'https://localhost:8888/authorization',
              accessTokenUrl: 'https://localhost:8888/token',
              userInfoUrl: 'https://localhost:8888/user',
              logoutUrl: 'https://localhost:8888/logout',
            },
          },
        ],
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();

    const TestRenderer = ({ componentProps }) => {
      const data = useLazyLoadQuery<ListSSOConfigurationTestQuery>(query, {});
      if (!data) return null;
      return <ListSSOConfiguration query={data} {...componentProps} />;
    };

    TestListSSOConfigurationSuperAdmin = componentProps => (
      <RelaySuspensFragmentTest
        environment={environment}
        store={{
          user: { user: { roles: ['ROLE_SUPER_ADMIN'] } },
        }}>
        <TestRenderer componentProps={componentProps} />
      </RelaySuspensFragmentTest>
    );

    TestListSSOConfiguration = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  afterEach(() => {
    clearSupportForPortals();
  });

  describe('<TestListSSOConfigurationSuperAdmin />', () => {
    it('should render correctly with items', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestListSSOConfigurationSuperAdmin isSuperAdmin />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render correctly with empty list', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          ssoConfigurations: {
            ...$refType,
            edges: [],
          },
        }),
      );

      testComponentTree = ReactTestRenderer.create(
        <TestListSSOConfigurationSuperAdmin isSuperAdmin />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });

  describe('<TestListSSOConfiguration>', () => {
    it('renders correctly with only Public SSO list when user is not a super admin', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          ssoConfigurations: {
            ...$refType,
            edges: [],
          },
        }),
      );

      testComponentTree = ReactTestRenderer.create(
        <TestListSSOConfiguration isSuperAdmin={false} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
