// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import moment from 'moment';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { SectionProposalCategoriesTestQuery } from '~relay/SectionProposalCategoriesTestQuery.graphql';
import SectionProposalCategories from './SectionProposalCategories';

describe('<SectionProposalCategories />', () => {
  let environment;
  let testComponentTree;
  let TestSectionProposalCategories;

  const query = graphql`
    query SectionProposalCategoriesTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        mostUsedProposalCategories {
          ...SectionProposalCategories_categories
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsMostUsedProposalCategories: () => ({
      totalCount: 6,
      values: [
        {
          category: {
            id: 'category-123',
            name: 'Justice',
          },
          totalCount: 2,
        },
        {
          category: {
            id: 'category-456',
            name: 'Environment',
          },
          totalCount: 4,
        },
      ],
    }),
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const queryVariables = {
      filter: {
        startAt: moment('2000-11-08T17:44:56.144').toString(),
        endAt: moment('2020-11-08T17:44:56.144').toString(),
        projectId: null,
      },
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionProposalCategoriesTestQuery>(query, variables);
      if (!data?.analytics?.mostUsedProposalCategories) return null;
      return (
        <SectionProposalCategories
          categories={data.analytics.mostUsedProposalCategories}
          {...componentProps}
        />
      );
    };

    TestSectionProposalCategories = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestSectionProposalCategories />', () => {
    it('should render correctly with registrations', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionProposalCategories />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
