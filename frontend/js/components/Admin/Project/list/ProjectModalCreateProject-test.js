// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import ProjectModalCreateProject from './ProjectModalCreateProject';
import type { ProjectModalCreateProjectTestQuery } from '~relay/ProjectModalCreateProjectTestQuery.graphql';
import { intlMock } from '~/mocks';

describe('<ProjectModalCreateProject />', () => {
  let environment;
  let testComponentTree;
  let TestModalCreateProject;

  const query = graphql`
    query ProjectModalCreateProjectTestQuery @relay_test_operation {
      ...ProjectModalCreateProject_query
    }
  `;

  const defaultMockResolvers = {
    Project: () => ({
      id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
      title: 'Budget Participatif IdF 3',
      contributions: {
        totalCount: 5,
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const intl = intlMock;
    const viewerId = 'VXNlcjp1c2VyMQ==';
    const modalInitialValues = {
      title: '',
      type: '1',
      author: {
        value: viewerId,
        label: 'lbrunet',
      },
    };
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProjectModalCreateProjectTestQuery>(query, variables);
      if (data) {
        return (
          <ProjectModalCreateProject
            viewerId={viewerId}
            isAdmin
            intl={intl}
            query={data}
            orderBy="DESC"
            term=""
            initialValues={modalInitialValues}
            hasProjects={false}
            {...componentProps}
          />
        );
      }

      return null;
    };

    TestModalCreateProject = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  afterEach(() => {
    clearSupportForPortals();
  });

  describe('<TestModalCreateProject />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalCreateProject />);
      expect(testComponentTree).toMatchSnapshot();
    });
    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalCreateProject />);
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
