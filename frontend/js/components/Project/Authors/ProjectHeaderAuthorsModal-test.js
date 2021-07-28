// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer from 'react-test-renderer';
import ProjectHeaderAuthorsModal from './ProjectHeaderAuthorsModal';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ProjectHeaderAuthorsModalTestQuery } from '~relay/ProjectHeaderAuthorsModalTestQuery.graphql';

describe('<ProjectHeaderAuthorsModal />', () => {
  let environment;
  let TestComponent;
  let handleClose;

  const query = graphql`
    query ProjectHeaderAuthorsModalTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderAuthorsModal_project
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
      const data = useLazyLoadQuery<ProjectHeaderAuthorsModalTestQuery>(query, {});
      if (!data.project) return null;
      return (
        <ProjectHeaderAuthorsModal project={data.project} onClose={handleClose} show {...props} />
      );
    };
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        User: () => ({
          id: 'VXNlcjp1c2VyQWRtaW4=',
          username: 'admin',
          avatarUrl: null,
          url: 'https://capco.dev/profile/admin',
          userType: {
            name: 'Citoyen',
          },
          media: null,
        }),
      }),
    );
  });

  it('renders correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
