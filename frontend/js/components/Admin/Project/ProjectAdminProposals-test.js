// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminProposals } from './ProjectAdminProposals';
import { $refType, relayPaginationMock } from '~/mocks';
import { AnalysisProposalListNoContributions } from '~ui/Analysis/common.style';

const DEFAULT_PROJECT = {
  id: 'UHJvamVjdDpwcm9qZWN0Ng==',
  steps: [
    {
      id: 'cstep1',
      title: 'Étape de dépôt',
      url: 'http://example.com',
      __typename: 'CollectStep',
      statuses: [
        {
          id: 'status1',
          name: 'Approuvé',
          color: 'success',
        },
        {
          id: 'status2',
          name: 'Rejeté',
          color: 'danger',
        },
      ],
      form: {
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
      __typename: 'SelectionStep',
      id: 'selectionStep1',
      title: 'Sélection',
      url: 'http://example.com',
      statuses: [
        {
          id: 'status4',
          name: 'Soumis au vote',
          color: 'info',
        },
        {
          id: 'status5',
          name: 'Vote gagné',
          color: 'success',
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
          id: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          title: 'Ravalement de la façade de la bibliothèque municipale',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [{ step: { id: 'selectionStep1' } }],
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
          adminUrl: 'https://capco.dev/admin/lapropo12',
          reference: '12',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDg=',
          title: 'Renovation of the gymnasium',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'success',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [{ step: { id: 'selectionStep1' } }],
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
          adminUrl: 'https://capco.dev/admin/lapropo2',
          reference: '2',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          title: 'Rénovation du gymnase',
          status: {
            id: 'status2',
            name: 'Approuvé',
            color: 'success',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [],
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
          adminUrl: 'https://capco.dev/admin/lapropo3',
          reference: '3',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwz',
          title: 'Installation de bancs sur la place de la mairie',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [{ step: { id: 'selectionStep1' } }],
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
          adminUrl: 'https://capco.dev/admin/lapropo4',
          reference: '4',
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
          selections: [],
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
          adminUrl: 'https://capco.dev/admin/lapropo7',
          reference: '7',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMA==',
          title: 'Proposition pas encore votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [],
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
          adminUrl: 'https://capco.dev/admin/lapropo8',
          reference: '8',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          title: 'Proposition plus votable',
          status: {
            id: 'status1',
            name: 'En cours',
            color: 'info',
          },
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [],
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
          adminUrl: 'https://capco.dev/admin/lapropo1104',
          reference: '1104',
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDQ=',
          title: 'Test de publication avec accusé de réception',
          status: null,
          form: {
            step: {
              id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
              title: 'Collecte des propositions',
            },
          },
          selections: [],
        },
        cursor: 'YToyOntpOjA7aToxNTIzMzk3NjAwMDAwO2k6MTtzOjExOiJwcm9wb3NhbDEwNCI7fQ==',
      },
    ],
  },
};

describe('<ProjectAdminProposals />', () => {
  const defaultProps = {
    relay: { ...relayPaginationMock },
    project: {
      $refType,
      ...DEFAULT_PROJECT,
    },
  };

  it('renders correctly when the project have proposals', () => {
    const wrapper = shallow(<ProjectAdminProposals {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the "No proposals" placeholder when the project does not have any proposals', () => {
    const props = {
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
      },
    };
    const wrapper = shallow(<ProjectAdminProposals {...props} />);
    expect(wrapper.find(AnalysisProposalListNoContributions)).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });
});
