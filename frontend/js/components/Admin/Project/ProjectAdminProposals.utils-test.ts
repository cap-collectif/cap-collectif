/* eslint-env jest */
import {
  getFormattedAllCategoriesForProject,
  getFormattedAllDistrictsForProject,
  getFormattedStatusesChoicesForProjectStep,
  getFormattedStepsChoicesForProject,
} from '~/components/Admin/Project/ProjectAdminProposals.utils'
import { $refType } from '~/mocks'
import 'core-js'

const DEFAULT_PROJECT = {
  ' $refType': $refType,
  id: 'UHJvamVjdDpwcm9qZWN0Ng==',
  adminAlphaUrl: 'http://example.com',
  steps: [
    {
      id: 'cstep1',
      title: 'Étape de dépôt',
      __typename: 'CollectStep',
      label: 'step label',
      statuses: [
        {
          id: 'status1',
          name: 'Approuvé',
          color: 'primary',
        },
        {
          id: 'status2',
          name: 'Rejeté',
          color: 'danger',
        },
      ],
      form: {
        usingThemes: false,
        categories: [
          {
            id: 'pCategory1',
            name: 'Aménagement',
          },
          {
            id: 'pCategory2',
            name: 'Politique',
          },
        ],
        districts: [
          {
            id: 'district1',
            name: 'Mon beau quartier',
          },
          {
            id: 'district2',
            name: 'Noisyzoo',
          },
        ],
      },
    },
    {
      id: 'sstep1',
      title: 'Étape de sélection',
      __typename: 'SelectionStep',
      label: 'step label',
      statuses: [
        {
          id: 'status1',
          name: 'En cours',
          color: 'primary',
        },
        {
          id: 'status2',
          name: 'Sélectionnée',
          color: 'success',
        },
        {
          id: 'status3',
          name: 'Un autre status',
          color: 'danger',
        },
      ],
      form: {
        usingThemes: false,
        categories: [
          {
            id: 'pCategory1',
            name: 'Aménagement',
          },
          {
            id: 'pCategory2',
            name: 'Politique',
          },
        ],
        districts: [
          {
            id: 'district1',
            name: 'Mon beau quartier',
          },
          {
            id: 'district2',
            name: 'Noisyzoo',
          },
        ],
      },
    },
  ],
  proposals: {
    totalCount: 8,
    pageInfo: {
      hasNextPage: false,
    },
    edges: [
      {
        node: {
          author: {
            username: 'welcomattic',
            id: 'VXNlcjp1c2VyV2VsY29tYXR0aWM=',
          },
          publishedAt: '2017-02-01 00:00:00',
          district: {
            id: 'district1',
            name: 'Beauregard',
          },
          category: {
            id: 'pCategory2',
            name: 'Politique',
          },
          reference: '1',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          title: 'Ravalement de la façade de la bibliothèque municipale',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          currentVotableStep: {
            id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            title: 'Sélection',
          },
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==',
      },
      {
        node: {
          author: {
            username: 'johnsmith',
            id: 'VXNlcjp1c2VyNTIy',
          },
          publishedAt: '2017-02-01 00:03:00',
          district: {
            id: 'district2',
            name: 'Nord Saint-Martin',
          },
          category: {
            id: 'pCategory1',
            name: 'Aménagement',
          },
          reference: '12',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDg=',
          title: 'Renovation of the gymnasium',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'success',
          },
          currentVotableStep: null,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwOCI7fQ==',
      },
      {
        node: {
          author: {
            username: 'user',
            id: 'VXNlcjp1c2VyNQ==',
          },
          publishedAt: '2017-02-01 00:03:00',
          district: {
            id: 'district2',
            name: 'Nord Saint-Martin',
          },
          category: {
            id: 'pCategory1',
            name: 'Aménagement',
          },
          reference: '2',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          title: 'Rénovation du gymnase',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'success',
          },
          currentVotableStep: {
            id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            title: 'Sélection',
          },
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==',
      },
      {
        node: {
          author: {
            username: 'welcomattic',
            id: 'VXNlcjp1c2VyV2VsY29tYXR0aWM=',
          },
          publishedAt: '2017-02-01 00:04:00',
          district: {
            id: 'district4',
            name: 'Beaulieu',
          },
          category: {
            id: 'pCategory2',
            name: 'Politique',
          },
          reference: '3',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwz',
          title: 'Installation de bancs sur la place de la mairie',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          currentVotableStep: {
            id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            title: 'Sélection',
          },
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==',
      },
      {
        node: {
          author: {
            username: 'user7',
            id: 'VXNlcjp1c2VyNw==',
          },
          publishedAt: '2017-02-01 00:04:19',
          district: {
            id: 'district2',
            name: 'Nord Saint-Martin',
          },
          category: null,
          reference: '4',
          id: 'UHJvcG9zYWw6cHJvcG9zYWw0',
          title:
            "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
          status: null,
          currentVotableStep: null,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODU5MDAwO2k6MTtzOjk6InByb3Bvc2FsNCI7fQ==',
      },
      {
        node: {
          author: {
            username: 'admin',
            id: 'VXNlcjp1c2VyQWRtaW4=',
          },
          publishedAt: '2017-02-01 00:07:00',
          district: {
            id: 'district3',
            name: 'Maurepas Patton',
          },
          category: null,
          reference: '7',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMA==',
          title: 'Proposition pas encore votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          currentVotableStep: {
            id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNg==',
            title: 'Sélection à venir',
          },
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDIwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDEwIjt9',
      },
      {
        node: {
          author: {
            username: 'admin',
            id: 'VXNlcjp1c2VyQWRtaW4=',
          },
          publishedAt: '2017-02-01 00:08:00',
          district: {
            id: 'district3',
            name: 'Maurepas Patton',
          },
          category: null,
          reference: '8',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          title: 'Proposition plus votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          currentVotableStep: {
            id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMw==',
            title: 'Fermée',
          },
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDgwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDExIjt9',
      },
      {
        node: {
          author: {
            username: 'admin',
            id: 'VXNlcjp1c2VyQWRtaW4=',
          },
          publishedAt: '2018-04-11 00:00:00',
          district: null,
          category: null,
          reference: '1104',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDQ=',
          title: 'Test de publication avec accusé de réception',
          status: null,
          currentVotableStep: null,
        },
        cursor: 'YToyOntpOjA7aToxNTIzMzk3NjAwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwNCI7fQ==',
      },
    ],
  },
  themes: [
    {
      id: 'theme-1',
      title: 'Immobilier',
    },
    {
      id: 'theme-2',
      title: 'Justice',
    },
    {
      id: 'theme-3',
      title: 'Environnement',
    },
  ],
}
describe('ProjectAdminProposals utils functions', () => {
  it('should get a correctly formatted categories choices for a given project', () => {
    const categories = getFormattedAllCategoriesForProject(DEFAULT_PROJECT)
    expect(categories).toHaveLength(2)
    expect(categories).toMatchSnapshot()
  })
  it('should get a correctly formatted districts choices for a given project', () => {
    const districts = getFormattedAllDistrictsForProject(DEFAULT_PROJECT)
    expect(districts).toHaveLength(2)
    expect(districts).toMatchSnapshot()
  })
  it('should get a correctly formatted steps choices for a given project', () => {
    const steps = getFormattedStepsChoicesForProject(DEFAULT_PROJECT)
    expect(steps).toHaveLength(2)
    expect(steps).toMatchSnapshot()
  })
  it('should get a correctly formatted step statuses choices for a given step', () => {
    const cstep1Statuses = getFormattedStatusesChoicesForProjectStep(DEFAULT_PROJECT, 'cstep1')
    expect(cstep1Statuses).toHaveLength(2)
    expect(cstep1Statuses).toMatchSnapshot()
    const sstep1Statuses = getFormattedStatusesChoicesForProjectStep(DEFAULT_PROJECT, 'sstep1')
    expect(sstep1Statuses).toHaveLength(3)
    expect(sstep1Statuses).toMatchSnapshot()
  })
})
