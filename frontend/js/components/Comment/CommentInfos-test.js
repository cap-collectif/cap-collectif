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
import CommentInfos from './CommentInfos';
import type { CommentInfosTestQuery } from '~relay/CommentInfosTestQuery.graphql';

describe('<CommentInfos />', () => {
  let environment;
  let testComponentTree;
  let TestCommentInfos;

  const query = graphql`
    query CommentInfosTestQuery($id: ID = "<default>") @relay_test_operation {
      comment: node(id: $id) {
        ...CommentInfos_comment
      }
    }
  `;

  const defaultAuthor = {
    displayName: 'Toto',
    url: 'https://aa.com/',
  };

  const defaultComment = {
    id: 'commentId',
    title: 'Post FR 12',
    author: defaultAuthor,
    authorName: 'Poupidou',
    pinned: false,
    moderationStatus: 'APPROVED',
  };

  const defaultMockResolvers = {
    Comment: () => defaultComment,
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<CommentInfosTestQuery>(query, variables);

      if (data?.comment) {
        return <CommentInfos comment={data?.comment} {...componentProps} />;
      }

      return null;
    };

    TestCommentInfos = componentProps => (
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

  describe('<TestCommentInfos />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestCommentInfos />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render correctly with no author', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Comment: () => ({
            ...defaultComment,
            author: null,
          }),
        }),
      );
      testComponentTree = ReactTestRenderer.create(<TestCommentInfos />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
