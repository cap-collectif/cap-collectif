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
import type { ModalSectionMostVisitedPagesTestQuery } from '~relay/ModalSectionMostVisitedPagesTestQuery.graphql';
import ModalSectionMostVisitedPages from './ModalSectionMostVisitedPages';

describe('<ModalSectionMostVisitedPages />', () => {
  let environment;
  let testComponentTree;
  let TestModalSectionMostVisitedPages;

  const query = graphql`
    query ModalSectionMostVisitedPagesTestQuery($filter: QueryAnalyticsFilter!)
      @relay_test_operation {
      analytics(filter: $filter) {
        mostVisitedPages {
          ...ModalSectionMostVisitedPages_mostVisitedPages
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
      const data = useLazyLoadQuery<ModalSectionMostVisitedPagesTestQuery>(query, variables);
      if (!data?.analytics?.mostVisitedPages) return null;
      return (
        <ModalSectionMostVisitedPages
          mostVisitedPages={data.analytics.mostVisitedPages}
          {...componentProps}
        />
      );
    };

    TestModalSectionMostVisitedPages = componentProps => (
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

  describe('<TestModalSectionMostVisitedPages />', () => {
    it('should render correctly with most visited pages', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalSectionMostVisitedPages show onClose={jest.fn()} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
