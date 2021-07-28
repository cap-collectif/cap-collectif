// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import UserGroupModal from './UserGroupModal';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { UserGroupModalTestQuery } from '~relay/UserGroupModalTestQuery.graphql';

describe('<UserGroupModal />', () => {
  let environment;
  let TestComponent;
  let handleClose;

  const defaultMockResolvers = {};
  const query = graphql`
    query UserGroupModalTestQuery($id: ID = "<default>", $first: Int, $cursor: String)
      @relay_test_operation {
      project: node(id: $id) {
        ...UserGroupModal_project @arguments(count: $first, cursor: $cursor)
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
      const data = useLazyLoadQuery<UserGroupModalTestQuery>(query, { first: 10, cursor: null });
      if (!data.project) return null;
      return <UserGroupModal handleClose={handleClose} show project={data.project} {...props} />;
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
  it('should render correctly without group', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          id: 'UHJvamVjdDpwcm9qZWN0MQ==',
          restrictedViewers: {
            edges: [],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with 2 groups', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          id: 'project2',
          restrictedViewers: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
                node: {
                  id: 'group2',
                  title: 'Un groupe cool',
                },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
                node: {
                  id: 'group3',
                  title: 'mon super groupe 2',
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

  it('should render correctly with load more', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          id: 'project2',
          restrictedViewers: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
                node: {
                  id: 'group2',
                  title: 'Un groupe cool',
                },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
                node: {
                  id: 'group3',
                  title: 'mon super groupe 2',
                },
              },
            ],
            pageInfo: {
              hasPreviousPage: false,
              hasNextPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            },
            totalCount: 10,
          },
        }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
