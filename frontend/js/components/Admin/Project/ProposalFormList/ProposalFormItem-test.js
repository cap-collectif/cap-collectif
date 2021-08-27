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
import type { ProposalFormItemTestQuery } from '~relay/ProposalFormItemTestQuery.graphql';
import ProposalFormItem from './ProposalFormItem';

describe('<ProposalFormItem />', () => {
  let environment;
  let testComponentTree;
  let TestProposalFormItem;

  const query = graphql`
    query ProposalFormItemTestQuery($id: ID = "<default>") @relay_test_operation {
      proposalForm: node(id: $id) {
        ...ProposalFormItem_proposalForm
      }
    }
  `;

  const defaultMockResolvers = {
    ProposalForm: () => ({
      id: 'proposalForm-1',
      title: 'Combien font 0 + 0 ?',
      adminUrl: '/admin/proposalForm/proposalForm-1',
      createdAt: '2050-03-01 12:00:00',
      updatedAt: '2050-03-01 12:00:00',
      step: {
        project: {
          title: 'Le projet de la vie',
        },
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProposalFormItemTestQuery>(query, variables);

      if (data?.proposalForm) {
        return <ProposalFormItem proposalForm={data.proposalForm} {...componentProps} />;
      }
      return null;
    };

    TestProposalFormItem = componentProps => (
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

  describe('<TestProposalFormItem />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestProposalFormItem
          connectionName="client:root:__ProposalFormList_proposalForms_connection"
          isAdmin
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
