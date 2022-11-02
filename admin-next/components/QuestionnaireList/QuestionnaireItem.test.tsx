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

describe('<QuestionnaireItem />', () => {
    let environment: any;
    let testComponentTree;
    let TestQuestionnaireItem: any;

    const query = graphql`
        query QuestionnaireItemTestQuery($id: ID = "<default>") @relay_test_operation {
            questionnaire: node(id: $id) {
                ...QuestionnaireItem_questionnaire
            }
            viewer {
                ...QuestionnaireItem_viewer
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
            creator: {
                __typename: 'User',
                id: 'VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=',
                username: 'Val\u00e9rie Masson Delmotte',
            },
        }),
        User: () => ({
            id: 'userId',
            isAdminOrganization: false,
            isAdmin: true,
            organizations: null,
        }),
    };

    const orgaMemberMockResolvers = {
        ...defaultMockResolvers,
        User: (context: any) => {
            if (context.name === 'creator') {
                return {
                    id: 'VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=',
                    username: 'Val\u00e9rie Masson Delmotte',
                };
            }
            return {
                id: 'abc',
                isAdminOrganization: false,
                isAdmin: false,
                organizations: [
                    {
                        id: 'organizationId',
                    },
                ],
            };
        },
    };

    beforeEach(() => {
        addsSupportForPortals();
        environment = createMockEnvironment();
        const queryVariables = {};

        const TestRenderer = ({ componentProps, queryVariables: variables }) => {
            const data = useLazyLoadQuery<QuestionnaireItemTestQuery>(query, variables);

            if (data?.questionnaire && data?.viewer) {
                return (
                    <QuestionnaireItem
                        questionnaire={data.questionnaire}
                        viewer={data.viewer}
                        {...componentProps}
                    />
                );
            }
            return null;
        };

        TestQuestionnaireItem = componentProps => (
            <RelaySuspensFragmentTest environment={environment}>
                <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
            </RelaySuspensFragmentTest>
        );
    });

    afterEach(() => {
        clearSupportForPortals();
    });

    describe('<TestQuestionnaireItem />', () => {
        it('should render correctly', () => {
            environment.mock.queueOperationResolver(operation =>
                MockPayloadGenerator.generate(operation, defaultMockResolvers),
            );
            testComponentTree = ReactTestRenderer.create(
                <TestQuestionnaireItem connectionName="client:root:__QuestionnaireList_questionnaires_connection" />,
            );
            expect(testComponentTree).toMatchSnapshot();
        });

        it('should hide delete button when viewer belongs to an organization and is not admin organization', () => {
            environment.mock.queueOperationResolver(operation =>
                MockPayloadGenerator.generate(operation, orgaMemberMockResolvers),
            );
            testComponentTree = ReactTestRenderer.create(
                <TestQuestionnaireItem connectionName="client:root:__QuestionnaireList_questionnaires_connection" />,
            );
            expect(testComponentTree).toMatchSnapshot();
        });
    });
});
