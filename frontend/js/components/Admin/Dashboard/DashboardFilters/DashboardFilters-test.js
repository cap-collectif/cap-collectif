// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { DashboardFiltersTestQuery } from '~relay/DashboardFiltersTestQuery.graphql';
import DashboardFilters from './DashboardFilters';
import { DashboardPageContext } from '../DashboardPage.context';

describe('<DashboardFilters />', () => {
  let environment;
  let testComponentTree;
  let TestDashboardFilters;

  const query = graphql`
    query DashboardFiltersTestQuery @relay_test_operation {
      viewer {
        ...DashboardFilters_viewer
      }
    }
  `;

  const defaultMockResolvers = {
    User: () => ({
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

  const contextValue = {
    filters: {
      startAt: '2014-12-01T00:00:00.000Z',
      endAt: '2020-12-01T00:00:00.000Z',
      projectId: 'ALL',
    },
    setFilters: jest.fn(),
    isAdmin: true,
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<DashboardFiltersTestQuery>(query, variables);
      if (!data) return null;
      return <DashboardFilters viewer={data.viewer} {...componentProps} />;
    };

    TestDashboardFilters = ({ context, ...componentProps }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <DashboardPageContext.Provider value={context}>
          <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
        </DashboardPageContext.Provider>
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestDashboardFilters />', () => {
    it('should render correctly when user is admin', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestDashboardFilters
          defaultFilters={{
            startAt: '2014-12-01T00:00:00.000Z',
            endAt: '2020-12-01T00:00:00.000Z',
            projectId: 'ALL',
          }}
          context={contextValue}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
    it('should render correctly when user is project admin', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestDashboardFilters
          defaultFilters={{
            startAt: '2014-12-01T00:00:00.000Z',
            endAt: '2020-12-01T00:00:00.000Z',
            projectId: 'ALL',
          }}
          context={{
            ...contextValue,
            isAdmin: false,
          }}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
