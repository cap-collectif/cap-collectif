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
import ModalCreateQuestionnaire from './ModalCreateQuestionnaire';
import type { ModalCreateQuestionnaireTestQuery } from '@relay/ModalCreateQuestionnaireTestQuery.graphql';

describe('<ModalCreateQuestionnaire />', () => {
    let environment: any;
    let testComponentTree: any;
    let TestModalCreateQuestionnaire: any;

    const query = graphql`
        query ModalCreateQuestionnaireTestQuery @relay_test_operation {
            viewer {
                ...ModalCreateQuestionnaire_viewer
            }
        }
    `;

    const defaultMockResolvers = {
        User: () => ({
            __typename: 'User',
            id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
            username: 'Le testeur',
        }),
    };

    beforeEach(() => {
        addsSupportForPortals();
        environment = createMockEnvironment();

        const queryVariables = {};

        const TestRenderer = ({ componentProps, queryVariables: variables }) => {
            const data = useLazyLoadQuery<ModalCreateQuestionnaireTestQuery>(query, variables);
            if (data) {
                return (
                    <ModalCreateQuestionnaire
                        viewer={data.viewer}
                        orderBy="DESC"
                        term=""
                        {...componentProps}
                    />
                );
            }

            return null;
        };

        TestModalCreateQuestionnaire = componentProps => (
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

    describe('<TestModalCreateProject />', () => {
        it('should render correctly', () => {
            testComponentTree = ReactTestRenderer.create(<TestModalCreateQuestionnaire />);
            expect(testComponentTree).toMatchSnapshot();
        });

        it('should render modal open', () => {
            testComponentTree = ReactTestRenderer.create(<TestModalCreateQuestionnaire />);
            const fakeEvent = {};
            testComponentTree.root.findByType('button').props.onClick(fakeEvent);
            expect(testComponentTree).toMatchSnapshot();
        });
    });
});
