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
import PostPostListModalConfirmationDelete from './PostPostListModalConfirmationDelete';
import type { PostPostListModalConfirmationDeleteTestQuery } from '~relay/PostPostListModalConfirmationDeleteTestQuery.graphql';

describe('<ModalConfirmationDelete />', () => {
  let environment;
  let testComponentTree;
  let TestModalConfirmationDelete;

  const query = graphql`
    query PostPostListModalConfirmationDeleteTestQuery($id: ID = "<default>")
      @relay_test_operation {
      post: node(id: $id) {
        ...PostPostListModalConfirmationDelete_post
      }
    }
  `;

  const defaultMockResolvers = {
    Post: () => ({
      id: 'UG9zdDpwb3N0MTI=',
      title: 'Post FR 12',
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<PostPostListModalConfirmationDeleteTestQuery>(query, variables);

      if (data?.post) {
        return <PostPostListModalConfirmationDelete post={data?.post} {...componentProps} />;
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
        <TestModalConfirmationDelete connectionName="client:VXNlcjp1c2VyMQ==:__PostList_posts_connection" />,
      );
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestModalConfirmationDelete connectionName="client:VXNlcjp1c2VyMQ==:__PostList_posts_connection" />,
      );
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});
