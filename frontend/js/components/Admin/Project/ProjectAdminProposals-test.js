// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminProposals } from './ProjectAdminProposals';
import { $refType, $fragmentRefs, relayPaginationMock } from '~/mocks';
import 'core-js';
import MockProviders from '~/testUtils';

const DEFAULT_MERGED_PROPOSALS_PROJECT = {
  id: 'UHJvamVjdDpwcm9dzdqZWN0Ng==',
  title: 'Default merge proposal project',
  slug: 'default-merged-proposal-project',
  type: {
    title: 'project.types.participatoryBudgeting',
  },
  exportableSteps: [
    {
      position: 0,
      step: {
        id: 'selectionStep1',
        slug: 'selection-step-1',
        __typename: 'SelectionStep',
        title: 'selectionStep1',
      },
    },
  ],
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
          color: 'SUCCESS',
        },
        {
          id: 'status2',
          name: 'Rejeté',
          color: 'DANGER',
        },
      ],
      form: {
        id: 'form1',
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
        objectType: 'PROPOSAL',
        canContact: false,
      },
    },
    {
      __typename: 'SelectionStep',
      id: 'selectionStep1',
      title: 'Sélection',
      label: 'step label',
      statuses: [
        {
          id: 'status4',
          name: 'Soumis au vote',
          color: 'INFO',
        },
        {
          id: 'status5',
          name: 'Vote gagné',
          color: 'SUCCESS',
        },
      ],
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
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo1',
          reference: '1',
          fullReference: '1-1',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          title: 'Ravalement de la façade de la bibliothèque municipale',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: true,
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
          adminUrl: 'https://capco.dev/admin/lapropo12',
          reference: '12',
          fullReference: '1-12',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDg=',
          title: 'Renovation of the gymnasium',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'SUCCESS',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwOCI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: true,
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
          adminUrl: 'https://capco.dev/admin/lapropo2',
          reference: '2',
          fullReference: '1-2',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          title: 'Rénovation du gymnase',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'SUCCESS',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo3',
          reference: '3',
          fullReference: '1-3',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwz',
          title: 'Installation de bancs sur la place de la mairie',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 0,
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo4',
          reference: '4',
          fullReference: '1-4',
          id: 'UHJvcG9zYWw6cHJvcG9zYWw0',
          title:
            "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
          status: null,
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODU5MDAwO2k6MTtzOjk6InByb3Bvc2FsNCI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo7',
          reference: '7',
          fullReference: '1-7',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMA==',
          title: 'Proposition pas encore votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDIwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDEwIjt9',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo8',
          reference: '8',
          fullReference: '1-8',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          title: 'Proposition plus votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDgwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDExIjt9',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
          author: {
            username: 'admin',
            id: 'VXNlcjp1c2VyQWRtaW4=',
          },
          publishedAt: '2018-04-11 00:00:00',
          district: null,
          category: null,
          adminUrl: 'https://capco.dev/admin/lapropo1104',
          reference: '1104',
          fullReference: '1-1104',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDQ=',
          title: 'Test de publication avec accusé de réception',
          status: null,
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNTIzMzk3NjAwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwNCI7fQ==',
      },
    ],
  },
  proposalsAll: {
    totalCount: 9,
  },
  proposalsDraft: {
    totalCount: 2,
  },
  proposalsTrashed: {
    totalCount: 3,
  },
  proposalsPublished: {
    totalCount: 4,
  },
  proposalsArchived: {
    totalCount: 4,
  },
};

const DEFAULT_PROJECT = {
  id: 'UHJvamVjdDpwcm9qZWN0Ng==',
  title: 'je suis un titre',
  slug: 'je-suis-un-slug',
  type: {
    title: 'project.types.participatoryBudgeting',
  },
  exportableSteps: [
    {
      position: 0,
      step: {
        id: 'selectionStep1',
        slug: 'selection-step-1',
        __typename: 'SelectionStep',
        title: 'selectionStep1',
      },
    },
    {
      position: 1,
      step: {
        title: 'selectionStep2',
        id: 'selectionStep2',
        slug: 'selection-step-2',
        __typename: 'SelectionStep',
      },
    },
  ],
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
          color: 'SUCCESS',
        },
        {
          id: 'status2',
          name: 'Rejeté',
          color: 'DANGER',
        },
      ],
      form: {
        id: 'form2',
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
        objectType: 'PROPOSAL',
        canContact: false,
      },
    },
    {
      __typename: 'SelectionStep',
      id: 'selectionStep1',
      title: 'Sélection',
      label: 'step label',
      statuses: [
        {
          id: 'status4',
          name: 'Soumis au vote',
          color: 'INFO',
        },
        {
          id: 'status5',
          name: 'Vote gagné',
          color: 'SUCCESS',
        },
      ],
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
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo1',
          reference: '1',
          fullReference: '1-1',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          title: 'Ravalement de la façade de la bibliothèque municipale',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo12',
          reference: '12',
          fullReference: '1-12',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDg=',
          title: 'Renovation of the gymnasium',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'SUCCESS',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwOCI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo2',
          reference: '2',
          fullReference: '1-2',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          title: 'Rénovation du gymnase',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'SUCCESS',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzNzgwMDAwO2k6MTtzOjk6InByb3Bvc2FsMiI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo3',
          reference: '3',
          fullReference: '1-3',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwz',
          title: 'Installation de bancs sur la place de la mairie',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [{ step: { id: 'selectionStep1', title: 'Selection step 1 title' } }],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODQwMDAwO2k6MTtzOjk6InByb3Bvc2FsMyI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo4',
          reference: '4',
          fullReference: '1-4',
          id: 'UHJvcG9zYWw6cHJvcG9zYWw0',
          title:
            "Plantation de tulipes dans les jardinière du parking de l'église avec un titre très long pour tester la césure",
          status: null,
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTAzODU5MDAwO2k6MTtzOjk6InByb3Bvc2FsNCI7fQ==',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo7',
          reference: '7',
          fullReference: '1-7',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMA==',
          title: 'Proposition pas encore votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDIwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDEwIjt9',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
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
          adminUrl: 'https://capco.dev/admin/lapropo8',
          reference: '8',
          fullReference: '1-8',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          title: 'Proposition plus votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'INFO',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNDg1OTA0MDgwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDExIjt9',
      },
      {
        node: {
          $fragmentRefs,
          hasBeenMerged: false,
          author: {
            username: 'admin',
            id: 'VXNlcjp1c2VyQWRtaW4=',
          },
          publishedAt: '2018-04-11 00:00:00',
          district: null,
          category: null,
          adminUrl: 'https://capco.dev/admin/lapropo1104',
          reference: '1104',
          fullReference: '1-1104',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDQ=',
          title: 'Test de publication avec accusé de réception',
          status: null,
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          proposalVotes: {
            totalCount: 10,
            totalPointsCount: 26,
          },
          selections: [],
          trashed: false,
          draft: false,
          paperVotesTotalCount: 0,
          paperVotesTotalPointsCount: 0,
          canContactAuthor: false,
          nbrOfMessagesSentToAuthor: 0,
        },
        cursor: 'YToyOntpOjA7aToxNTIzMzk3NjAwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwNCI7fQ==',
      },
    ],
  },
  proposalsAll: {
    totalCount: 9,
  },
  proposalsDraft: {
    totalCount: 2,
  },
  proposalsTrashed: {
    totalCount: 3,
  },
  proposalsPublished: {
    totalCount: 4,
  },
  proposalsArchived: {
    totalCount: 0,
  },
};

const themes = [
  {
    $refType,
    id: 'theme-1',
    title: 'Immobilier',
  },
  {
    $refType,
    id: 'theme-2',
    title: 'Justice',
  },
  {
    $refType,
    id: 'theme-3',
    title: 'Environnement',
  },
];

describe('<ProjectAdminProposals />', () => {
  const defaultProps = {
    relay: { ...relayPaginationMock },
    project: {
      $refType,
      ...DEFAULT_PROJECT,
    },
    themes,
    viewerIsAdmin: true,
    baseUrl: 'jesuislurldebase',
    hasContributionsStep: true,
  };

  const props = {
    basic: defaultProps,
    withMergeProposals: {
      ...defaultProps,
      project: {
        $refType,
        ...DEFAULT_MERGED_PROPOSALS_PROJECT,
      },
    },
    noContributionStep: {
      ...defaultProps,
      hasContributionsStep: false,
    },
    noProposals: {
      ...defaultProps,
      project: {
        ...defaultProps.project,
        proposals: {
          totalCount: 0,
          pageInfo: {
            hasNextPage: false,
          },
          edges: [],
        },
        proposalsAll: {
          totalCount: 0,
        },
        proposalsDraft: {
          totalCount: 0,
        },
        proposalsTrashed: {
          totalCount: 0,
        },
        proposalsPublished: {
          totalCount: 0,
        },
        proposalsArchived: {
          totalCount: 0,
        },
      },
    },
  };

  it('renders correctly when the project have proposals', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with badges when the project has merged proposals', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.withMergeProposals} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly  when no contributions step', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.noContributionStep} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the "No proposals" placeholder when the project does not have any proposals', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.noProposals} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when the project have proposals when user is not an admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.basic} viewerIsAdmin={false} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with badges when the project has merged proposals when user is not an admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.withMergeProposals} viewerIsAdmin={false} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly  when no contributions step when user is not an admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.noContributionStep} viewerIsAdmin={false} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the "No proposals" placeholder when the project does not have any proposals when user is not an admin', () => {
    const wrapper = shallow(
      <MockProviders store={{ default: { parameters: { 'color.btn.primary.bg': '#546E7A' } } }}>
        <ProjectAdminProposals {...props.noProposals} viewerIsAdmin={false} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
