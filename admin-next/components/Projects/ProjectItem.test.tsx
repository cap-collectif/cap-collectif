/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ProjectItem from './ProjectItem';
import {
    addsSupportForPortals,
    clearSupportForPortals,
    RelaySuspensFragmentTest,
} from 'tests/testUtils';
import type { ProjectItemTestQuery } from '@relay/ProjectItemTestQuery.graphql';

describe('<ProjectItem />', () => {
    let environment: any;
    let TestComponent: any;
    let testComponentTree: any;

    const defaultMockResolvers = {
        Project: () => ({
            id: 'UHJvamVjdDpwcm9qZWN0Mg==',
            title: "Stratégie technologique de l'Etat et services publics",
            themes: [
                {
                    id: 'theme1',
                    title: 'Immobilier',
                    url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
                },
                {
                    id: 'theme3',
                    title: 'Transport',
                    url: 'https://capco.dev/themes/transport?_locale=fr-FR',
                },
            ],
            owner: {
                id: 'VXNlcjp1c2VyQWRtaW4=',
                url: 'https://capco.dev/profile/admin',
                username: 'admin',
            },
            visibility: 'PUBLIC',
            publishedAt: '2014-12-30 00:00:00',
            url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie',
            adminUrl:
                'https://capco.dev/admin/capco/app/project/project2/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
            adminAlphaUrl:
                'https://capco.dev/admin/alpha/project/project2/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
            contributions: {
                totalCount: 54,
            },
            exportContributorsUrl:
                'https://capco.dev/export-project-contributors/project2?_locale=fr-FR',
            exportableSteps: [
                {
                    position: 1,
                    step: {
                        __typename: 'ConsultationStep',
                        id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDI=',
                        title: 'Collecte des avis pour une meilleur stratégie',
                        exportStepUrl:
                            'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/collecte-des-avis-pour-une-meilleur-strategie/download?_locale=fr-FR',
                        exportContributorsUrl:
                            'https://capco.dev/export-step-contributors/cstep2?_locale=fr-FR',
                    },
                    id: 'pas2',
                },
                {
                    position: 4,
                    step: {
                        __typename: 'ConsultationStep',
                        id: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
                        title: 'Étape de multi-consultation',
                        exportStepUrl:
                            'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/etape-de-multi-consultation/download?_locale=fr-FR',
                        exportContributorsUrl:
                            'https://capco.dev/export-step-contributors/multiCstep1?_locale=fr-FR',
                    },
                    id: 'pasMultiConsultation1',
                },
            ],
            __typename: 'Project',
        }),
        User: () => ({
            isAdmin: false,
            isAdminOrganization: false,
            isOnlyProjectAdmin: false,
            isSuperAdmin: false,
            organizations: null,
        })
    };
    const query = graphql`
        query ProjectItemTestQuery($id: ID = "<default>") @relay_test_operation {
            project: node(id: $id) {
                ...ProjectItem_project
            }
            viewer {
                ...ProjectItem_viewer
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
            const data = useLazyLoadQuery<ProjectItemTestQuery>(query, queryVariables);
            if (!data.project && !data.viewer) return null;
            return (
                <ProjectItem
                    project={data.project}
                    viewer={data.viewer}
                    connectionName="client:VXNlcjp1c2VyMQ==:__ProjectList_projects_connection"
                    {...props}
                />
            );
        };
        TestComponent = props => (
            <RelaySuspensFragmentTest environment={environment}>
                <TestRenderer {...props} />
            </RelaySuspensFragmentTest>
        );
    });

    it('should render correctly', () => {
        environment.mock.queueOperationResolver(operation =>
            MockPayloadGenerator.generate(operation, defaultMockResolvers),
        );
        testComponentTree = ReactTestRenderer.create(<TestComponent />);
        expect(testComponentTree).toMatchSnapshot();
    });
    it('should render correctly without authors', () => {
        environment.mock.queueOperationResolver(operation =>
            MockPayloadGenerator.generate(operation, {
                ...defaultMockResolvers,
                Project: () => ({
                    id: 'UHJvamVjdDpwcm9qZWN0Mg==',
                    title: "Stratégie technologique de l'Etat et services publics",
                    themes: [
                        {
                            id: 'theme1',
                            title: 'Immobilier',
                            url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
                        },
                        {
                            id: 'theme3',
                            title: 'Transport',
                            url: 'https://capco.dev/themes/transport?_locale=fr-FR',
                        },
                    ],
                    owner: null,
                    visibility: 'PUBLIC',
                    publishedAt: '2014-12-30 00:00:00',
                    url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie',
                    adminUrl:
                        'https://capco.dev/admin/capco/app/project/project2/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
                    adminAlphaUrl:
                        'https://capco.dev/admin/alpha/project/project2/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
                    contributions: {
                        totalCount: 54,
                    },
                    exportContributorsUrl:
                        'https://capco.dev/export-project-contributors/project2?_locale=fr-FR',
                    exportableSteps: [
                        {
                            position: 1,
                            step: {
                                __typename: 'ConsultationStep',
                                id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDI=',
                                title: 'Collecte des avis pour une meilleur stratégie',
                                exportStepUrl:
                                    'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/collecte-des-avis-pour-une-meilleur-strategie/download?_locale=fr-FR',
                                exportContributorsUrl:
                                    'https://capco.dev/export-step-contributors/cstep2?_locale=fr-FR',
                            },
                            id: 'pas2',
                        },
                        {
                            position: 4,
                            step: {
                                __typename: 'ConsultationStep',
                                id: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
                                title: 'Étape de multi-consultation',
                                exportStepUrl:
                                    'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/etape-de-multi-consultation/download?_locale=fr-FR',
                                exportContributorsUrl:
                                    'https://capco.dev/export-step-contributors/multiCstep1?_locale=fr-FR',
                            },
                            id: 'pasMultiConsultation1',
                        },
                    ],
                    __typename: 'Project',
                }),
            }),
        );
        testComponentTree = ReactTestRenderer.create(<TestComponent />);
        expect(testComponentTree).toMatchSnapshot();
    });
    it('should render correctly without themes', () => {
        environment.mock.queueOperationResolver(operation =>
            MockPayloadGenerator.generate(operation, {
                ...defaultMockResolvers,
                Project: () => ({
                    id: 'UHJvamVjdDpwcm9qZWN0Mg==',
                    title: "Stratégie technologique de l'Etat et services publics",
                    themes: [],
                    owner: {
                        id: 'VXNlcjp1c2VyQWRtaW4=',
                        url: 'https://capco.dev/profile/admin',
                        username: 'admin',
                    },
                    visibility: 'PUBLIC',
                    publishedAt: '2014-12-30 00:00:00',
                    url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie',
                    adminUrl:
                        'https://capco.dev/admin/capco/app/project/project2/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
                    adminAlphaUrl:
                        'https://capco.dev/admin/alpha/project/project2/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
                    contributions: {
                        totalCount: 54,
                    },
                    exportContributorsUrl:
                        'https://capco.dev/export-project-contributors/project2?_locale=fr-FR',
                    exportableSteps: [
                        {
                            position: 1,
                            step: {
                                __typename: 'ConsultationStep',
                                id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDI=',
                                title: 'Collecte des avis pour une meilleur stratégie',
                                exportStepUrl:
                                    'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/collecte-des-avis-pour-une-meilleur-strategie/download?_locale=fr-FR',
                                exportContributorsUrl:
                                    'https://capco.dev/export-step-contributors/cstep2?_locale=fr-FR',
                            },
                            id: 'pas2',
                        },
                        {
                            position: 4,
                            step: {
                                __typename: 'ConsultationStep',
                                id: 'Q29uc3VsdGF0aW9uU3RlcDptdWx0aUNzdGVwMQ==',
                                title: 'Étape de multi-consultation',
                                exportStepUrl:
                                    'https://capco.dev/projects/strategie-technologique-de-letat-et-services-publics/step/etape-de-multi-consultation/download?_locale=fr-FR',
                                exportContributorsUrl:
                                    'https://capco.dev/export-step-contributors/multiCstep1?_locale=fr-FR',
                            },
                            id: 'pasMultiConsultation1',
                        },
                    ],
                    __typename: 'Project',
                }),
            }),
        );
        testComponentTree = ReactTestRenderer.create(<TestComponent />);
        expect(testComponentTree).toMatchSnapshot();
    });
    it('should render correctly without exportable steps', () => {
        environment.mock.queueOperationResolver(operation =>
            MockPayloadGenerator.generate(operation, {
                ...defaultMockResolvers,
                Project: () => ({
                    id: 'UHJvamVjdDpwcm9qZWN0Mg==',
                    title: "Stratégie technologique de l'Etat et services publics",
                    themes: [
                        {
                            id: 'theme1',
                            title: 'Immobilier',
                            url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
                        },
                        {
                            id: 'theme3',
                            title: 'Transport',
                            url: 'https://capco.dev/themes/transport?_locale=fr-FR',
                        },
                    ],
                    owner: {
                        id: 'VXNlcjp1c2VyQWRtaW4=',
                        url: 'https://capco.dev/profile/admin',
                        username: 'admin',
                    },
                    visibility: 'PUBLIC',
                    publishedAt: '2014-12-30 00:00:00',
                    url: 'https://capco.dev/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie',
                    adminUrl:
                        'https://capco.dev/admin/capco/app/project/project2/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
                    adminAlphaUrl:
                        'https://capco.dev/admin/alpha/project/project2/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
                    contributions: {
                        totalCount: 54,
                    },
                    exportContributorsUrl: null,
                    exportableSteps: [],
                    __typename: 'Project',
                }),
            }),
        );
        testComponentTree = ReactTestRenderer.create(<TestComponent />);
        expect(testComponentTree).toMatchSnapshot();
    });
});
