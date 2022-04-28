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
import type { QuestionnaireItemTestQuery } from '@relay/QuestionnaireItemTestQuery.graphql';
import QuestionnaireItem from './QuestionnaireItem';
import { appContextValue } from '../../jest-setup';
import { AppContext } from 'components/AppProvider/App.context';

describe('<QuestionnaireItem />', () => {
    let environment: any;
    let testComponentTree;
    let TestQuestionnaireItem: any;

    const query = graphql`
        query QuestionnaireItemTestQuery($id: ID = "<default>") @relay_test_operation {
            questionnaire: node(id: $id) {
                ...QuestionnaireItem_questionnaire
            }
        }
    `;

    const defaultMockResolvers = {
        Questionnaire: () => ({
            id: 'questionnaire-1',
            title: 'Combien font 0 + 0 ?',
            adminUrl: '/admin/questionnaire/questionnaire-1',
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
            const data = useLazyLoadQuery<QuestionnaireItemTestQuery>(query, variables);

            if (data?.questionnaire) {
                return <QuestionnaireItem questionnaire={data.questionnaire} {...componentProps} />;
            }
            return null;
        };

        TestQuestionnaireItem = componentProps => (
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

    describe('<TestQuestionnaireItem />', () => {
        it('should render correctly', () => {
            testComponentTree = ReactTestRenderer.create(
                <TestQuestionnaireItem connectionName="client:root:__QuestionnaireList_questionnaires_connection" />,
            );
            expect(testComponentTree).toMatchSnapshot();
        });
    });
});
