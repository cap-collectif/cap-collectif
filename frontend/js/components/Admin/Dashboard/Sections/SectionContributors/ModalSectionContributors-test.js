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
import type { ModalSectionContributorsTestQuery } from '~relay/ModalSectionContributorsTestQuery.graphql';
import ModalSectionContributors from './ModalSectionContributors';

describe('<ModalSectionContributors />', () => {
  let environment;
  let testComponentTree;
  let TestModalSectionContributors;

  const query = graphql`
    query ModalSectionContributorsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        contributors {
          ...ModalSectionContributors_contributors
        }
        anonymousContributors {
          ...ModalSectionContributors_anonymousContributors
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
      const data = useLazyLoadQuery<ModalSectionContributorsTestQuery>(query, variables);
      const anonymousContributors = data?.analytics?.anonymousContributors;
      const contributors = data?.analytics?.contributors;
      if (!contributors && !anonymousContributors) return null;
      return (
        <ModalSectionContributors
          anonymousContributors={anonymousContributors}
          contributors={contributors}
          {...componentProps}
        />
      );
    };

    TestModalSectionContributors = componentProps => (
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

  describe('<TestModalSectionContributors />', () => {
    it('should render correctly with contributors', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalSectionContributors show onClose={jest.fn()} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
