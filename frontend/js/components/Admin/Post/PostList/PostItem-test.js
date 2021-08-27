// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import PostItem from '~/components/Admin/Post/PostList/PostItem';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { PostItemTestQuery } from '~relay/PostItemTestQuery.graphql';

describe('<PostItem />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    Post: () => ({
      id: 'UG9zdDpwb3N0MTI=',
      title: 'Post FR 12',
      adminUrl: 'https://localhost:8000/admin/capco/app/post/post12/edit?_locale=fr-FR',
      url: 'https://localhost/blog/post-fr-12',
      authors: [
        {
          id: 'VXNlcjp1c2VyMQ==',
          url: 'https://localhost/profile/lbrunet',
          username: 'lbrunet',
        },
      ],
      isPublished: true,
      updatedAt: '2021-08-04 17:50:27',
      relatedContent: [
        {
          __typename: 'Theme',
          title: 'Immobilier',
          url: 'https://localhost:8000/themes/immobilier?_locale=fr-FR',
        },
        {
          __typename: 'Theme',
          title: 'Justice',
          url: 'https://localhost:8000/themes/justice?_locale=fr-FR',
        },
      ],
    }),
  };
  const query = graphql`
    query PostItemTestQuery($id: ID = "<default>") @relay_test_operation {
      post: node(id: $id) {
        ...PostItem_post
      }
    }
  `;
  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};
    const TestRenderer = props => {
      const data = useLazyLoadQuery<PostItemTestQuery>(query, queryVariables);
      if (!data.post) return null;
      return (
        <PostItem
          post={data.post}
          connectionName="client:VXNlcjp1c2VyMQ==:__PostList_posts_connection"
          {...props}
        />
      );
    };
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
