// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import moment from 'moment';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { SectionTopContributorsTestQuery } from '~relay/SectionTopContributorsTestQuery.graphql';
import SectionTopContributors from './SectionTopContributors';

describe('<SectionTopContributors />', () => {
  let environment;
  let testComponentTree;
  let TestSectionTopContributors;

  const query = graphql`
    query SectionTopContributorsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        topContributors {
          ...SectionTopContributors_topContributors
        }
      }
    }
  `;

  const defaultMockResolvers = {
    User: () => ({
      username: 'Vince',
    }),
    PlatformAnalyticsContributorContribution: () => ({
      type: 'PROPOSAL',
      totalCount: 5,
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
      const data = useLazyLoadQuery<SectionTopContributorsTestQuery>(query, variables);
      if (!data?.analytics?.topContributors) return null;
      return (
        <SectionTopContributors
          topContributors={data.analytics.topContributors}
          {...componentProps}
        />
      );
    };

    TestSectionTopContributors = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('<TestSectionTopContributors />', () => {
    it('should render correctly with top contributors', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionTopContributors />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
