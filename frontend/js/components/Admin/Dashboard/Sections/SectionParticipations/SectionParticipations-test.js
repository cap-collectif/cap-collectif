// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import moment from 'moment';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { SectionParticipationsTestQuery } from '~relay/SectionParticipationsTestQuery.graphql';
import SectionParticipations from './SectionParticipations';

describe('<SectionParticipations />', () => {
  let environment;
  let testComponentTree;
  let TestSectionParticipations;

  const query = graphql`
    query SectionParticipationsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        ...SectionParticipations_analytics
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsVotes: () => ({
      totalCount: 50,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 25,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 25,
        },
      ],
    }),
    PlatformAnalyticsComments: () => ({
      totalCount: 10,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 5,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 5,
        },
      ],
    }),
    PlatformAnalyticsContributions: () => ({
      totalCount: 30,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 15,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 15,
        },
      ],
    }),
    PlatformAnalyticsFollowers: () => ({
      totalCount: 50,
      values: [
        {
          key: '2014-12-01T00:00:00.000Z',
          totalCount: 10,
        },
        {
          key: '2015-01-01T00:00:00.000Z',
          totalCount: 40,
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
      const data = useLazyLoadQuery<SectionParticipationsTestQuery>(query, variables);
      if (!data?.analytics) return null;
      return <SectionParticipations analytics={data.analytics} {...componentProps} />;
    };

    TestSectionParticipations = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestSectionParticipations />', () => {
    it('should render correctly with participations data', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionParticipations />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
