// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import moment from 'moment';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { SectionMostVisitedPagesTestQuery } from '~relay/SectionMostVisitedPagesTestQuery.graphql';
import SectionMostVisitedPages from './SectionMostVisitedPages';

describe('<SectionMostVisitedPages />', () => {
  let environment;
  let testComponentTree;
  let TestSectionMostVisitedPages;

  const query = graphql`
    query SectionMostVisitedPagesTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        mostVisitedPages {
          ...SectionMostVisitedPages_mostVisitedPages
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsMostVisitedPages: () => ({
      totalCount: 110,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 50,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 60,
        },
      ],
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {
      filter: {
        startAt: moment('2000-11-08T17:44:56.144').toString(),
        endAt: moment('2020-11-08T17:44:56.144').toString(),
        projectId: null,
      },
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionMostVisitedPagesTestQuery>(query, variables);
      if (!data?.analytics?.mostVisitedPages) return null;
      return (
        <SectionMostVisitedPages
          mostVisitedPages={data.analytics.mostVisitedPages}
          {...componentProps}
        />
      );
    };

    TestSectionMostVisitedPages = componentProps => (
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

  describe('<TestSectionMostVisitedPages />', () => {
    it('should render correctly with most visited pages', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionMostVisitedPages />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
