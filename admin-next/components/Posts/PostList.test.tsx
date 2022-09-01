/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import PostList from './PostList';
import {
    addsSupportForPortals,
    clearSupportForPortals,
    RelaySuspensFragmentTest,
} from '../../tests/testUtils';
import { PostListTestQuery } from '@relay/PostListTestQuery.graphql';

describe('<PostList />', () => {
    let environment: any;
    let TestComponent: any;

    const defaultMockResolvers = {
        User: () => ({
            posts: {
                __id: 'client:VXNlcjp1c2VyMQ==:__PostList_posts_connection',
                totalCount: 2,
                edges: [
                    {
                        node: {
                            id: 'UG9zdDpwb3N0MTI=',
                            title: 'Post FR 12',
                            url: 'https://localhost/blog/post-fr-12',
                        },
                    },
                    {
                        node: {
                            id: 'UG9zdDpwb3N0MTM=',
                            title: 'Post FR 13',
                            url: 'https://localhost/blog/post-fr-13',
                        },
                    },
                ],
            },
        }),
    };
    const query = graphql`
        query PostListTestQuery($count: Int, $cursor: String, $term: String) @relay_test_operation {
            viewer {
                ...PostList_viewer @arguments(count: $count, cursor: $cursor, term: $term)
            }
        }
    `;

    beforeEach(() => {
        addsSupportForPortals();
        environment = createMockEnvironment();
        const queryVariables = {
            count: 10,
            cursor: null,
            term: null,
        };

        const TestRenderer = props => {
            const data = useLazyLoadQuery<PostListTestQuery>(query, queryVariables);
            if (!data.viewer) return null;
            return (
                <PostList viewer={data.viewer} isAdmin term="" resetTerm={jest.fn()} {...props} />
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
    afterEach(() => {
        clearSupportForPortals();
    });

    it('should render correctly', () => {
        const wrapper = ReactTestRenderer.create(<TestComponent />);
        expect(wrapper).toMatchSnapshot();
    });
});
