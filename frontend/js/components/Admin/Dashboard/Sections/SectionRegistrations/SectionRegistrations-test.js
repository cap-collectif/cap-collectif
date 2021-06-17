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
import type { SectionRegistrationsTestQuery } from '~relay/SectionRegistrationsTestQuery.graphql';
import SectionRegistrations from './SectionRegistrations';

describe('<SectionRegistrations />', () => {
  let environment;
  let testComponentTree;
  let TestSectionRegistrations;

  const query = graphql`
    query SectionRegistrationsTestQuery($filter: QueryAnalyticsFilter!) @relay_test_operation {
      analytics(filter: $filter) {
        registrations {
          ...SectionRegistrations_registrations
        }
      }
    }
  `;

  const defaultMockResolvers = {
    PlatformAnalyticsRegistrations: () => ({
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
      const data = useLazyLoadQuery<SectionRegistrationsTestQuery>(query, variables);
      if (!data?.analytics?.registrations) return null;
      return (
        <SectionRegistrations registrations={data.analytics.registrations} {...componentProps} />
      );
    };

    TestSectionRegistrations = componentProps => (
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

  describe('<TestSectionRegistrations />', () => {
    it('should render correctly with contributors', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionRegistrations />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
