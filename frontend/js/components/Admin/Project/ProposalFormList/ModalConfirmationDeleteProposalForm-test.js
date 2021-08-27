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
import type { ModalConfirmationDeleteProposalFormTestQuery } from '~relay/ModalConfirmationDeleteProposalFormTestQuery.graphql';
import ModalConfirmationDelete from './ModalConfirmationDelete';

describe('<ModalConfirmationDelete />', () => {
  let environment;
  let testComponentTree;
  let TestModalConfirmationDelete;

  const query = graphql`
    query ModalConfirmationDeleteProposalFormTestQuery($id: ID = "<default>")
      @relay_test_operation {
      proposalForm: node(id: $id) {
        ...ModalConfirmationDelete_proposalForm
      }
    }
  `;

  const defaultMockResolvers = {
    ProposalForm: () => ({
      id: 'proposalForm-1',
      title: 'Combien font 0 + 0 ?',
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ModalConfirmationDeleteProposalFormTestQuery>(query, variables);

      if (data?.proposalForm) {
        return <ModalConfirmationDelete proposalForm={data?.proposalForm} {...componentProps} />;
      }

      return null;
    };

    TestModalConfirmationDelete = componentProps => (
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

  describe('<TestModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalConfirmationDelete
          connectionName="client:root:__ProposalFormList_proposalForms_connection"
          isAdmin
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalConfirmationDelete
          connectionName="client:root:__ProposalFormList_proposalForms_connection"
          isAdmin
        />,
      );
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
