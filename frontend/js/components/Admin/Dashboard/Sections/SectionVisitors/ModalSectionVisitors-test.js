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
import type { ModalSectionVisitorsTestQuery } from '~relay/ModalSectionVisitorsTestQuery.graphql';
import ModalSectionVisitors from './ModalSectionVisitors';

describe('<ModalSectionVisitors />', () => {
  let environment;
  let testComponentTree;
  let TestModalSectionVisitors;

  const query = graphql`
    query ModalSectionVisitorsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        visitors {
          ...ModalSectionVisitors_visitors
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsVisitors: () => ({
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
      const data = useLazyLoadQuery<ModalSectionVisitorsTestQuery>(query, variables);
      if (!data?.analytics?.visitors) return null;
      return <ModalSectionVisitors visitors={data.analytics.visitors} {...componentProps} />;
    };

    TestModalSectionVisitors = componentProps => (
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

  describe('<TestModalSectionVisitors />', () => {
    it('should render correctly with visitors', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalSectionVisitors show onClose={jest.fn()} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
