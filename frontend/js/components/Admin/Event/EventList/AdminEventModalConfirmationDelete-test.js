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
import AdminEventModalConfirmationDelete from './AdminEventModalConfirmationDelete';
import { type AdminEventModalConfirmationDeleteTestQuery } from '~relay/AdminEventModalConfirmationDeleteTestQuery.graphql';

describe('<AdminEventModalConfirmationDelete />', () => {
  let environment;
  let testComponentTree;
  let TestAdminEventModalConfirmationDelete;

  const query = graphql`
    query AdminEventModalConfirmationDeleteTestQuery($id: ID = "<default>") @relay_test_operation {
      event: node(id: $id) {
        ...AdminEventModalConfirmationDelete_event
      }
    }
  `;

  const defaultMockResolvers = {
    Post: () => ({
      id: 'RXZlbnQ6ZXZlbnQz',
      title: 'GrenobleWeb2015',
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<AdminEventModalConfirmationDeleteTestQuery>(query, variables);

      if (data?.event) {
        return <AdminEventModalConfirmationDelete event={data?.event} {...componentProps} />;
      }

      return null;
    };

    TestAdminEventModalConfirmationDelete = componentProps => (
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

  describe('<TestAdminEventModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestAdminEventModalConfirmationDelete />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(<TestAdminEventModalConfirmationDelete />);
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
