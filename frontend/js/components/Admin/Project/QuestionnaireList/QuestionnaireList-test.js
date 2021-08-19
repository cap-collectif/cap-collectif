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
import type { QuestionnaireListTestQuery } from '~relay/QuestionnaireListTestQuery.graphql';
import QuestionnaireList from './QuestionnaireList';

describe('<QuestionnaireList />', () => {
  let environment;
  let testComponentTree;
  let TestQuestionnaireList;

  const query = graphql`
    query QuestionnaireListTestQuery($count: Int, $cursor: String, $term: String)
      @relay_test_operation {
      viewer {
        ...QuestionnaireList_viewer @arguments(count: $count, cursor: $cursor, term: $term)
      }
    }
  `;

  const defaultMockResolvers = {
    User: () => ({
      questionnaires: {
        __id: 'client:root:QuestionnaireList_questionnaires',
        totalCount: 2,
        edges: [
          {
            node: {
              id: 'questionnaire-1',
            },
          },
          {
            node: {
              id: 'questionnaire-2',
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
      const data = useLazyLoadQuery<QuestionnaireListTestQuery>(query, variables);
      if (!data && !data.viewer) return null;
      return <QuestionnaireList viewer={data.viewer} {...componentProps} />;
    };

    TestQuestionnaireList = componentProps => (
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

  describe('<TestQuestionnaireList />', () => {
    it('should render correctly when admin', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestQuestionnaireList
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
        <TestQuestionnaireList
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
