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
import type { SectionContributorsTestQuery } from '~relay/SectionContributorsTestQuery.graphql';
import SectionContributors from './SectionContributors';

describe('<SectionContributors />', () => {
  let environment;
  let testComponentTree;
  let TestSectionContributors;

  const query = graphql`
    query SectionContributorsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        contributors {
          ...SectionContributors_contributors
        }
        anonymousContributors {
          ...SectionContributors_anonymousContributors
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsContributors: () => ({
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
    PlatformAnalyticsAnonymousContributors: () => ({
      totalCount: 10,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 6,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 4,
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
      const data = useLazyLoadQuery<SectionContributorsTestQuery>(query, variables);
      if (!data?.analytics?.contributors && !data?.analytics?.anonymousContributors) return null;
      return (
        <SectionContributors
          anonymousContributors={data.analytics.anonymousContributors}
          contributors={data.analytics.contributors}
          {...componentProps}
        />
      );
    };

    TestSectionContributors = componentProps => (
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

  describe('<TestSectionContributors />', () => {
    it('should render correctly with contributors', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionContributors />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
