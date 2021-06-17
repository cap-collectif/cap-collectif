// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import moment from 'moment';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { SectionTrafficTestQuery } from '~relay/SectionTrafficTestQuery.graphql';
import SectionTraffic from './SectionTraffic';

describe('<SectionTraffic />', () => {
  let environment;
  let testComponentTree;
  let TestSectionTraffic;

  const query = graphql`
    query SectionTrafficTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        trafficSources {
          ...SectionTraffic_traffic
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsTrafficSources: () => ({
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
    environment = createMockEnvironment();
    const queryVariables = {
      filter: {
        startAt: moment('2000-11-08T17:44:56.144').toString(),
        endAt: moment('2020-11-08T17:44:56.144').toString(),
        projectId: null,
      },
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionTrafficTestQuery>(query, variables);
      if (!data?.analytics?.trafficSources) return null;
      return <SectionTraffic traffic={data.analytics.trafficSources} {...componentProps} />;
    };

    TestSectionTraffic = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestSectionTraffic />', () => {
    it('should render correctly with visitors', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionTraffic />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
