// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ProjectList from '~/components/Admin/Project/list/ProjectList';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ProjectListTestQuery } from '~relay/ProjectListTestQuery.graphql';

describe('<ProjectList />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    User: () => ({
      projects: {
        __id: 'client:VXNlcjp1c2VyMQ==:__ProjectList_projects_connection',
        totalCount: 35,
        edges: [
          {
            node: {
              id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
              title: 'Budget Participatif IdF 3',
              themes: [],
              authors: [
                {
                  id: 'VXNlcjp1c2VyQWRtaW4=',
                  url: 'https://capco.dev/profile/admin',
                  username: 'admin',
                },
              ],
              visibility: 'PUBLIC',
              publishedAt: '2021-05-01 12:00:00',
              url:
                'https://capco.dev/project/budget-participatif-idf-3/collect/collecte-des-projets-idf-brp-3',
              adminUrl:
                'https://capco.dev/admin/capco/app/project/projectIdf3/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
              adminAlphaUrl:
                'https://capco.dev/admin/alpha/project/projectIdf3/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
              contributions: {
                totalCount: 5,
              },
              exportContributorsUrl:
                'https://capco.dev/export-project-contributors/projectIdf3?_locale=fr-FR',
              exportableSteps: [
                {
                  position: 1,
                  step: {
                    __typename: 'CollectStep',
                    id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBJZGYz',
                    title: 'Collecte des projets Idf BRP 3',
                    exportStepUrl:
                      'https://capco.dev/projects/budget-participatif-idf-3/step/collecte-des-projets-idf-brp-3/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/collectstepIdf3?_locale=fr-FR',
                  },
                  id: 'pasBp3Idf1',
                },
                {
                  position: 2,
                  step: {
                    __typename: 'CollectStep',
                    id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBDbG9zZWRJZGYz',
                    title:
                      'Étape fermée, mais on peut modifier les réseaux sociaux des propositions',
                    exportStepUrl:
                      'https://capco.dev/projects/budget-participatif-idf-3/step/etape-fermee-mais-on-peut-modifier-les-reseaux-sociaux-des-propositions/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/collectStepClosedIdf3?_locale=fr-FR',
                  },
                  id: 'pasBp3ClosedIdf1',
                },
                {
                  position: 3,
                  step: {
                    __typename: 'SelectionStep',
                    id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM0FuYWx5c2U=',
                    title: 'Etudes des projets',
                    exportStepUrl:
                      'https://capco.dev/projects/budget-participatif-idf-3/step/etudes-des-projets/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/selectionStepIdf3Analyse?_locale=fr-FR',
                  },
                  id: 'pasBp3Idf2',
                },
                {
                  position: 4,
                  step: {
                    __typename: 'SelectionStep',
                    id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
                    title: 'Vote des Franciliens',
                    exportStepUrl:
                      'https://capco.dev/projects/budget-participatif-idf-3/step/vote-des-franciliens/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/selectionStepIdf3Vote?_locale=fr-FR',
                  },
                  id: 'pasBp3Idf13',
                },
                {
                  position: 5,
                  step: {
                    __typename: 'SelectionStep',
                    id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWQzZldpbm5lcnM=',
                    title: 'Le suivi des projets lauréats',
                    exportStepUrl:
                      'https://capco.dev/projects/budget-participatif-idf-3/step/le-suivi-des-projets-laureats/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/selectionStepId3fWinners?_locale=fr-FR',
                  },
                  id: 'pasBp3Idf4',
                },
              ],
              __typename: 'Project',
            },
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
          {
            node: {
              id: 'UHJvamVjdDpwcm9qZWN0Rm9vZA==',
              title: 'Food project',
              themes: [],
              authors: [
                {
                  id: 'VXNlcjp1c2VyVmluY2VudA==',
                  url: 'https://capco.dev/profile/vince',
                  username: 'Vince',
                },
              ],
              visibility: 'PUBLIC',
              publishedAt: '2020-09-15 12:00:00',
              url: 'https://capco.dev/project/food-project/questionnaire/questionnaire-food',
              adminUrl:
                'https://capco.dev/admin/capco/app/project/projectFood/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
              adminAlphaUrl:
                'https://capco.dev/admin/alpha/project/projectFood/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
              contributions: {
                totalCount: 0,
              },
              exportContributorsUrl:
                'https://capco.dev/export-project-contributors/projectFood?_locale=fr-FR',
              exportableSteps: [
                {
                  position: 1,
                  step: {
                    __typename: 'QuestionnaireStep',
                    id: 'questionnairestepFood1',
                    title: 'Questionnaire food',
                    exportStepUrl:
                      'https://capco.dev/projects/food-project/step/questionnaire-food/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/questionnairestepFood1?_locale=fr-FR',
                  },
                  id: 'pasFood1',
                },
              ],
              __typename: 'Project',
            },
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          },
          {
            node: {
              id: 'UHJvamVjdDpwcm9qZWN0QXJjaGl2ZWQ=',
              title: 'Projet Archivé',
              themes: [],
              authors: [
                {
                  id: 'VXNlcjp1c2VyU3B5bA==',
                  url: 'https://capco.dev/profile/spyl',
                  username: 'spyl',
                },
              ],
              visibility: 'PUBLIC',
              publishedAt: '2020-06-19 13:00:00',
              url: 'https://capco.dev/projects',
              adminUrl:
                'https://capco.dev/admin/capco/app/project/projectArchived/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
              adminAlphaUrl:
                'https://capco.dev/admin/alpha/project/projectArchived/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
              contributions: {
                totalCount: 0,
              },
              exportContributorsUrl:
                'https://capco.dev/export-project-contributors/projectArchived?_locale=fr-FR',
              exportableSteps: [],
              __typename: 'Project',
            },
            cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          },
          {
            node: {
              id: 'UHJvamVjdDpwcm9qZWN0Q29uZmluZW1lbnQ=',
              title: 'Débat du mois',
              themes: [],
              authors: [
                {
                  id: 'VXNlcjp1c2VyU3B5bA==',
                  url: 'https://capco.dev/profile/spyl',
                  username: 'spyl',
                },
              ],
              visibility: 'PUBLIC',
              publishedAt: '2020-06-19 13:00:00',
              url: 'https://capco.dev/project/debat-du-mois/debate/pour-ou-contre-le-reconfinement',
              adminUrl:
                'https://capco.dev/admin/capco/app/project/projectConfinement/edit?_sonata_admin=capco_admin.admin.project&_locale=fr-FR',
              adminAlphaUrl:
                'https://capco.dev/admin/alpha/project/projectConfinement/edit?_sonata_admin=capco_admin.admin.project&_sonata_name=admin_capco_app_project_edit&_locale=fr-FR',
              contributions: {
                totalCount: 196,
              },
              exportContributorsUrl:
                'https://capco.dev/export-project-contributors/projectConfinement?_locale=fr-FR',
              exportableSteps: [
                {
                  position: 1,
                  step: {
                    __typename: 'DebateStep',
                    id: 'RGViYXRlU3RlcDpkZWJhdGVTdGVwQ29uZmluZW1lbnQ=',
                    title: 'Pour ou contre le reconfinement ?',
                    exportStepUrl:
                      'https://capco.dev/projects/debat-du-mois/step/pour-ou-contre-le-reconfinement/download?_locale=fr-FR',
                    exportContributorsUrl:
                      'https://capco.dev/export-step-contributors/debateStepConfinement?_locale=fr-FR',
                  },
                  id: 'pasConfinement1',
                },
              ],
              __typename: 'Project',
            },
            cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          },
        ],
      },
    }),
  };
  const query = graphql`
    query ProjectListTestQuery($count: Int, $cursor: String, $term: String) @relay_test_operation {
      viewer {
        ...ProjectList_viewer @arguments(count: $count, cursor: $cursor, term: $term)
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
      const data = useLazyLoadQuery<ProjectListTestQuery>(query, queryVariables);
      if (!data.viewer) return null;
      return (
        <ProjectList
          viewer={data.viewer}
          isAdmin
          term=""
          resetTerm={jest.fn()}
          orderBy="DESC"
          setOrderBy={jest.fn()}
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
  afterEach(() => {
    clearSupportForPortals();
  });

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
