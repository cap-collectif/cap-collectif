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
import type { ProposalFormListTestQuery } from '~relay/ProposalFormListTestQuery.graphql';
import ProposalFormList from './ProposalFormList';

describe('<ProposalFormList />', () => {
  let environment;
  let testComponentTree;
  let TestProposalFormList;

  const query = graphql`
    query ProposalFormListTestQuery($count: Int, $cursor: String, $term: String)
      @relay_test_operation {
      viewer {
        ...ProposalFormList_viewer @arguments(count: $count, cursor: $cursor, term: $term)
      }
    }
  `;

  const defaultMockResolvers = {
    User: () => ({
      proposalForms: {
        __id: 'client:root:QuestionnaireList_questionnaires',
        totalCount: 2,
        edges: [
          {
            node: {
              id: 'proposalForm-1',
            },
          },
          {
            node: {
              id: 'proposalForm-2',
            },
          },
        ],
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {
      count: 10,
      cursor: null,
      term: null,
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProposalFormListTestQuery>(query, variables);
      if (!data && !data.viewer) return null;
      return <ProposalFormList viewer={data.viewer} {...componentProps} />;
    };

    TestProposalFormList = componentProps => (
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

  describe('<TestProposalFormList />', () => {
    it('should render correctly when admin', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestProposalFormList
          isAdmin
          term=""
          resetTerm={jest.fn()}
          orderBy="DESC"
          setOrderBy={jest.fn()}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render correctly when admin project', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestProposalFormList
          isAdmin={false}
          term=""
          resetTerm={jest.fn()}
          orderBy="DESC"
          setOrderBy={jest.fn()}
        />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
