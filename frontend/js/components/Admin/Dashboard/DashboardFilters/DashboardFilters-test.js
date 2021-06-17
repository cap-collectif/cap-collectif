// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { DashboardFiltersTestQuery } from '~relay/DashboardFiltersTestQuery.graphql';
import DashboardFilters from './DashboardFilters';

describe('<DashboardFilters />', () => {
  let environment;
  let testComponentTree;
  let TestDashboardFilters;

  const query = graphql`
    query DashboardFiltersTestQuery @relay_test_operation {
      ...DashboardFilters_query
    }
  `;

  const defaultMockResolvers = {
    Query: () => ({
      projects: {
        totalCount: 2,
        edges: [
          {
            node: {
              id: 'project-1',
              title: 'Project number one',
            },
          },
          {
            node: {
              id: 'project-2',
              title: 'Project number two',
            },
          },
        ],
      },
    }),
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<DashboardFiltersTestQuery>(query, variables);
      if (!data) return null;
      return <DashboardFilters query={data} {...componentProps} />;
    };

    TestDashboardFilters = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestDashboardFilters />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestDashboardFilters
          defaultFilters={{
            startAt: '2014-12-01T00:00:00.000Z',
            endAt: '2020-12-01T00:00:00.000Z',
            projectId: 'ALL',
          }}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
