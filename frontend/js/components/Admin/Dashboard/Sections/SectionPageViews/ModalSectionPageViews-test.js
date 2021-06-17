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
import type { ModalSectionPageViewsTestQuery } from '~relay/ModalSectionPageViewsTestQuery.graphql';
import ModalSectionPageViews from './ModalSectionPageViews';

describe('<ModalSectionPageViews />', () => {
  let environment;
  let testComponentTree;
  let TestModalSectionPageViews;

  const query = graphql`
    query ModalSectionPageViewsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        pageViews {
          ...ModalSectionPageViews_pageViews
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsPageViews: () => ({
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
      const data = useLazyLoadQuery<ModalSectionPageViewsTestQuery>(query, variables);
      if (!data?.analytics?.pageViews) return null;
      return <ModalSectionPageViews pageViews={data.analytics.pageViews} {...componentProps} />;
    };

    TestModalSectionPageViews = componentProps => (
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

  describe('<TestModalSectionPageViews />', () => {
    it('should render correctly with contributors', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalSectionPageViews show onClose={jest.fn()} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
