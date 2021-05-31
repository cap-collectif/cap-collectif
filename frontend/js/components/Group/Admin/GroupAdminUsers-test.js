// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {createMockEnvironment, MockPayloadGenerator} from "relay-test-utils";
import { GroupAdminUsers } from './GroupAdminUsers';
import {
  RelaySuspensFragmentTest,
  addsSupportForPortals,
  clearSupportForPortals,
} from '~/testUtils';
import type {GroupAdminUsersTestQuery} from "~relay/GroupAdminUsersTestQuery.graphql";
import {formMock} from "~/mocks";


describe('<GroupAdminUsers />', () => {

  let environment;
  let testComponentTree;
  let TestComponent;

  const defaultProps = {
    dispatch: jest.fn(),
    ...formMock,
  }

  const SuccessDeleteUser = {
    valid: false,
    userIsDeleted: true,
    userIsNotDeleted: false,
    submitFailed: false,
    submitSucceeded: false,
  };

  const FailDeleteUser = {
    valid: false,
    userIsDeleted: false,
    userIsNotDeleted: true,
    submitFailed: false,
    submitSucceeded: false,
  };

  const SuccessAddUser = {
    valid: true,
    userIsDeleted: false,
    userIsNotDeleted: false,
    submitFailed: false,
    submitSucceeded: true,
  };

  const FailAddUser = {
    valid: false,
    userIsDeleted: false,
    userIsNotDeleted: false,
    submitFailed: true,
    submitSucceeded: false,
  };


  const defaultMockResolvers = {
    Group: () => ({
      id: 'group4',
      title: 'Comité de suvi',
      users: {
        edges: [
          {
            node: {
              id: 'id1',
            },
          }
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '1',
          endCursor: '3',
        },
      }
    })
  }

  const query = graphql`
    query GroupAdminUsersTestQuery($id: ID = "<default>", $countUsers: Int, $cursorUsers: String, $countInvitations: Int, $cursorInvitations: String) @relay_test_operation {
      group: node(id: $id) {
        ...GroupAdminUsers_group @arguments(cursorUsers: $cursorUsers, countUsers: $countUsers)
        ...GroupAdminPendingInvitationsList_group @arguments(countInvitations: $countInvitations, cursorInvitations: $cursorInvitations)
      }
    }
  `

  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const TestRenderer = props => {
      const data = useLazyLoadQuery<GroupAdminUsersTestQuery>(query, {});
      if (!data.group) return null;
      return <GroupAdminUsers group={data.group} pendingInvitationFragmentRef={data.group} {...props} />;
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

  it('render correctly group admin user with confirmation notification when deleting a user', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent {...defaultProps} {...SuccessDeleteUser} />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('render correctly group admin user with error notification when deleting a user', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent {...defaultProps} {...FailDeleteUser} />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('render correctly group admin user with confirmation notification when adding a user', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent {...defaultProps} {...SuccessAddUser} />);
    expect(testComponentTree).toMatchSnapshot();
  });

  it('render correctly group admin user with error notification when adding a user', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent {...defaultProps} {...FailAddUser} />);
    expect(testComponentTree).toMatchSnapshot();
  });

});
