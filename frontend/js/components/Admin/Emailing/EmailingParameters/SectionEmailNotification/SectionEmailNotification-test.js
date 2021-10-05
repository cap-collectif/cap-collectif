// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { SectionEmailNotificationTestQuery } from '~relay/SectionEmailNotificationTestQuery.graphql';
import SectionEmailNotification from './SectionEmailNotification';

describe('<SectionEmailNotification />', () => {
  let environment;
  let testComponentTree;
  let TestSectionEmailNotification;

  const query = graphql`
    query SectionEmailNotificationTestQuery @relay_test_operation {
      ...SectionEmailNotification_query
    }
  `;

  const defaultMockResolvers = {
    Query: () => ({
      senderEmails: {
        id: 'sender-email-1',
        address: 'vince@test.com',
      },
      senderEmailDomains: {
        value: 'test.com',
        spfValidation: true,
        dkimValidation: true,
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionEmailNotificationTestQuery>(query, variables);
      if (!data) return null;
      return <SectionEmailNotification query={data} {...componentProps} />;
    };

    TestSectionEmailNotification = componentProps => (
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

  describe('<TestSectionEmailNotification />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestSectionEmailNotification
          initialValues={{
            'recipient-email': 'assistance@cap-collectif.com',
            'sender-email': 'assistance@cap-collectif.com',
            'sender-name': 'Cap Collectif',
          }}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
