/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
    addsSupportForPortals,
    clearSupportForPortals,
    RelaySuspensFragmentTest,
} from 'tests/testUtils';
import type { QuestionnaireListTestQuery } from '@relay/QuestionnaireListTestQuery.graphql';
import QuestionnaireList from './QuestionnaireList';
import { AppContext } from '../AppProvider/App.context';
import { appContextValue } from '../../jest-setup';

describe('<QuestionnaireList />', () => {
    let environment: any;
    let testComponentTree;
    let TestQuestionnaireList: any;

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

            if (data && data.viewer) {
                return <QuestionnaireList viewer={data.viewer} {...componentProps} />;
            }

            return null;
        };

        TestQuestionnaireList = componentProps => (
            <RelaySuspensFragmentTest environment={environment}>
                <AppContext.Provider value={appContextValue}>
                    <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
                </AppContext.Provider>
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
        it('should render correctly', () => {
            testComponentTree = ReactTestRenderer.create(
                <TestQuestionnaireList
                    term=""
                    resetTerm={jest.fn}
                    setOrderBy={jest.fn}
                    orderBy="DESC"
                />,
            );
            expect(testComponentTree).toMatchSnapshot();
        });
    });
});
