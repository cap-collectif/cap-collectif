// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer from 'react-test-renderer';
import MockProviders, {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import UserInGroupModal from './UserInGroupModal';
import type { UserInGroupModalTestQuery } from '~relay/UserInGroupModalTestQuery.graphql';

describe('<UserInGroupModal />', () => {
  let environment;
  let TestComponent;
  let handleClose;

  const defaultMockResolvers = {};
  const query = graphql`
    query UserInGroupModalTestQuery($id: ID = "<default>", $first: Int, $cursor: String)
    @relay_test_operation {
      group: node(id: $id) {
        ...UserInGroupModal_group @arguments(count: $first, cursor: $cursor)
      }
    }
  `;

  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    handleClose = jest.fn();
    const TestRenderer = props => {
      const data = useLazyLoadQuery<UserInGroupModalTestQuery>(query, { first: 10, cursor: null });
      if (!data.group) return null;
      return <UserInGroupModal handleClose={handleClose} show group={data.group} {...props} />;
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

  it('should render correctly without user in group', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Group: () => ({
          id: 'group1',
          title: 'Mon super groupe 1',
          users: {
            edges: [],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: false,
              startCursor: 'null',
              endCursor: 'null',
            },
            totalCount: 0,
          },
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with user in 2 groups', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Group: () => ({
          id: 'group2',
          title: 'Mon super groupe 2',
          users: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
                node: {
                  id: 'user1',
                  username: 'Perlinpinpin',
                  url: 'http://poudre.de/perlinpinpin',
                },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
                node: {
                  id: 'user2',
                  username: 'Toto',
                  url: 'htp://toto.com',
                },
              },
            ],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            },
            totalCount: 2,
          },
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with user in load more', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Group: () => ({
          id: 'group2',
          title: 'Mon super groupe 2',
          users: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
                node: {
                  id: 'user1',
                  username: 'Perlinpinpin',
                  url: 'http://poudre.de/perlinpinpin',
                },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
                node: {
                  id: 'user2',
                  username: 'Toto',
                  url: 'htp://toto.com',
                },
              },
            ],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            },
            totalCount: 2,
          },
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
