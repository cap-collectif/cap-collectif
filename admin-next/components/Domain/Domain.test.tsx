/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from 'tests/testUtils';
import Domain from './Domain';
import type { DomainTestQuery } from '@relay/DomainTestQuery.graphql';

describe('<Domain />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestDomain: any;

  const query = graphql`
      query DomainTestQuery @relay_test_operation {
          siteSettings {
              capcoDomain
              customDomain
              status
          }
      }
  `;

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<DomainTestQuery>(query, variables);
      if (data) {
        return (
          <Domain
            {...componentProps}
          />
        );
      }

      return null;
    };

    TestDomain = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );
  });

  afterEach(() => {
    clearSupportForPortals();
  });

  describe('<TestDomain />', () => {
    it('should render correctly with IDLE status', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          SiteSettings: () => ({
            capcoDomain: 'capco.domain.com',
            customDomain: null,
            status: 'IDLE'
          }),
        }),
      );
      testComponentTree = ReactTestRenderer.create(<TestDomain />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render correctly with ACTIVE status', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          SiteSettings: () => ({
            capcoDomain: 'capco.domain.com',
            customDomain: 'custom.domain.com',
            status: 'ACTIVE'
          }),
        }),
      );
      testComponentTree = ReactTestRenderer.create(<TestDomain />);
      expect(testComponentTree).toMatchSnapshot();
    });


  });
});
