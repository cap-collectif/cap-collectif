// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  RelaySuspensFragmentTest,
  addsSupportForPortals,
  clearSupportForPortals,
} from '~/testUtils';
import PostForm from '~/components/Admin/Post/PostForm/PostForm';
import type { PostFormTestQuery } from '~relay/PostFormTestQuery.graphql';
import { intlMock } from '~/mocks';

describe('<PostForm/>', () => {
  let environment;
  let testComponentTree;
  let TestPostForm;

  const query = graphql`
    query PostFormTestQuery($postId: ID!, $affiliations: [ProjectAffiliation!], $isAdmin: Boolean!)
      @relay_test_operation {
      ...PostForm_query @arguments(affiliations: $affiliations, isAdmin: $isAdmin, postId: $postId)
    }
  `;
  const defaultMockResolvers = {
    Query: () => ({
      post: {
        __typename: 'Post',
        id: 'UG9zdDpwb3N0MQ==',
      },
      viewer: {
        projects: {
          edges: [
            {
              node: {
                id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
                title: 'Budget Participatif IdF 3',
              },
            },
            {
              node: {
                id: 'UHJvamVjdDpwcm9qZWN0Rm9vZA==',
                title: 'Food project',
              },
            },
          ],
        },
        id: 'VXNlcjp1c2VyMQ==',
      },
      userList: {
        totalCount: 10,
        edges: [
          {
            node: {
              id: 'VXNlcjpkdXBsaWNhdGVzVXNlckNvbm5lY3RlZEZyYW5jZUNvbm5lY3Q=',
              username: 'LAMPE Gerare',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyQ29ubmVjdGVkRnJhbmNlQ29ubmVjdA==',
              username: 'LAMPE Geraldine',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VySWFu',
              username: 'Ian apprenti DevOps',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyTm90Q29ubmVjdGVkRnJhbmNlQ29ubmVjdA==',
              username: 'Angela Claire Louise',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyTWlja2FlbA==',
              username: 'Dev null',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyQWd1aQ==',
              username: 'Agui',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VySnBlYw==',
              username: 'Jpec',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyVGhlbw==',
              username: 'Théo QP',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VyT21hcg==',
              username: 'Omar <3 Rem',
            },
          },
          {
            node: {
              id: 'VXNlcjp1c2VySmVhbkR1cGxpY2F0ZXM=',
              username: 'Juan',
            },
          },
        ],
        themes: [
          {
            id: 'theme4',
            title: 'Thème vide',
          },
          {
            id: 'theme3',
            title: 'Transport',
          },
          {
            id: 'theme2',
            title: 'Justice',
          },
          {
            id: 'theme1',
            title: 'Immobilier',
          },
        ],
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();

    environment = createMockEnvironment();
    const queryVariables = {
      postId: 'UG9zdDpwb3N0MQ==',
      affiliations: null,
      isAdmin: true,
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<PostFormTestQuery>(query, variables);
      if (data) {
        return <PostForm query={data} {...componentProps} />;
      }

      return null;
    };

    TestPostForm = componentProps => (
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
  it('should render correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <TestPostForm
        initialValues={{
          DE_DE: {
            'DE_DE-title': 'german article',
            'DE_DE-body': '<p>GERMAN Content</p>',
            'DE_DE-abstract': null,
            'DE_DE-meta_description': null,
          },
          EN_GB: {
            'EN_GB-title': 'Post EN 1',
            'EN_GB-body': 'Body of post EN 1',
            'EN_GB-abstract': 'Abstract of post EN 1',
            'EN_GB-meta_description': null,
          },
          FR_FR: {
            'FR_FR-title': 'Post FR 1',
            'FR_FR-body': 'Contenu du post FR 1',
            'FR_FR-abstract': 'Résumé du post FR 1',
            'FR_FR-meta_description': null,
          },
          author: [
            { value: 'VXNlcjp1c2VyMQ==', label: 'lbrunet' },
            { value: 'VXNlcjp1c2VyNQ==', label: 'user' },
          ],
          media: {
            id: '72d8a0bf-115b-11ec-83f2-0242ac120004',
            url:
              'https://assets.cap.co/media/default/0001/01/2c0e4a9c2ed93fb48a8725daf753accc04e4c993.gif',
            name: 'ezgif.com-gif-maker (1).gif',
          },
          published_at: '2018-11-03 00:00:00',
          custom_code: null,
          has_comments: true,
          is_published: true,
          is_displayed: true,
          languages: 'FR_FR',
          project: [
            { value: 'UHJvamVjdDpwcm9qZWN0MQ==', label: 'Croissance, innovation, disruption' },
          ],
          theme: [{ value: 'theme1', label: 'Immobilier' }],
        }}
        locales={[
          {
            id: 'locale-de-DE',
            traductionKey: 'deutsch',
            code: 'DE_DE',
            isDefault: false,
            isEnabled: true,
          },
          {
            id: 'locale-en-GB',
            traductionKey: 'english',
            code: 'EN_GB',
            isDefault: false,
            isEnabled: true,
          },
          {
            id: 'b1819e8d-1146-11ec-83f2-0242ac120004',
            traductionKey: 'french',
            code: 'FR_FR',
            isDefault: true,
            isEnabled: true,
          },
        ]}
        intl={intlMock}
        isAdmin
      />,
    );
    expect(testComponentTree).toMatchSnapshot();
  });
});
