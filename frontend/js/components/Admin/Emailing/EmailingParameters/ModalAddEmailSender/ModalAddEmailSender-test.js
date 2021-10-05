// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { intlMock } from '~/mocks';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ModalAddEmailSenderTestQuery } from '~relay/ModalAddEmailSenderTestQuery.graphql';
import ModalAddEmailSender from './ModalAddEmailSender';

describe('<ModalAddEmailSender />', () => {
  let environment;
  let testComponentTree;
  let TestModalAddEmailSender;

  const query = graphql`
    query ModalAddEmailSenderTestQuery @relay_test_operation {
      senderEmailDomains {
        ...ModalAddEmailSender_senderEmailDomains
      }
    }
  `;

  const defaultMockResolvers = {
    SenderEmailDomain: () => ({
      value: 'test.com',
      spfValidation: true,
      dkimValidation: true,
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ModalAddEmailSenderTestQuery>(query, variables);

      if (data?.senderEmailDomains) {
        return (
          <ModalAddEmailSender senderEmailDomains={data?.senderEmailDomains} {...componentProps} />
        );
      }

      return null;
    };

    TestModalAddEmailSender = componentProps => (
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

  describe('<TestModalAddEmailSender />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalAddEmailSender intl={intlMock} initialValues={{ 'email-domain': 'test.com ' }} />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalAddEmailSender intl={intlMock} initialValues={{ 'email-domain': 'test.com ' }} />,
      );
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
