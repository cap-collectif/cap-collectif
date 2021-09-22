// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { DashboardTitleTestQuery } from '~relay/DashboardTitleTestQuery.graphql';
import DashboardTitle from './DashboardTitle';

describe('<DashboardTitle />', () => {
  let environment;
  let testComponentTree;
  let TestDashboardTitle;

  const query = graphql`
    query DashboardTitleTestQuery @relay_test_operation {
        viewer {
            ...DashboardTitle_viewer
        }
    }
  `;

  const defaultMockResolvers = {
    User: () => ({
      allProject: {
        totalCount: 10,
      },
      inProgressProjects: {
        totalCount: 5,
      },
      doneProjects: {
        totalCount: 5,
      },
    }),
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<DashboardTitleTestQuery>(query, variables);
      if (!data) return null;
      return <DashboardTitle viewer={data.viewer} {...componentProps} />;
    };

    TestDashboardTitle = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestDashboardTitle />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestDashboardTitle />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
