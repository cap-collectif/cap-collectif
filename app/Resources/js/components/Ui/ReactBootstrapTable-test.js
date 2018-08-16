// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
// import { $refType } from '../../mocks';
import { ReactBootstrapTable } from './ReactBootstrapTable';

describe('<ReactBootstrapTable />', () => {
  const data = [
    {
      title: {
        text: 'Title',
        value: {
          displayTitle: 'Ravalement de la façade de la bibliothèque municipale',
          url: 'http://google.com',
        },
        width: '100px',
      },
      implementationPhase: {
        text: 'implementation-phase',
        value: {
          list: [
            { title: 'Before', startAt: '2018-06-27 00:00:00', endAt: '2018-06-27 00:00:00' },
            { title: 'In progress', startAt: '2018-07-27 00:00:00', endAt: '2018-08-27 00:00:00' },
            { title: 'After', startAt: '2018-09-27 00:00:00', endAt: '2018-10-27 00:00:00' },
          ],
          title: 'In progress',
        },
        width: '250px',
      },
      status: { text: 'admin.fields.theme.status', value: 'my status' },
      author: {
        text: 'project_download.label.author',
        value: { displayName: 'Jean', media: null, url: 'http://google.com' },
      },
      ref: {
        text: 'proposal.admin.reference',
        value: '89789',
      },
      priceEstimation: {
        text: 'proposal.estimation',
        value: '347280',
      },
      likers: {
        text: 'project_download.label.likers',
        value: [{ displayName: 'Maude' }, { displayName: 'Marie' }],
      },
      lastActivity: {
        text: 'last-activity',
        value: {
          date: '2018-07-27 00:00:00',
          user: 'admin',
        },
      },
      publishedOn: {
        text: 'published-on',
        value: '2018-06-27 00:00:00',
      },
    },
    {
      title: {
        text: 'Title',
        value: {
          displayTitle: 'Installation de bancs sur la place de la mairie',
          url: 'http://google.com',
        },
      },
      implementationPhase: {
        text: 'implementation-phase',
        value: {
          list: [],
          title: null,
        },
      },
      status: { text: 'admin.fields.theme.status', value: null },
      author: {
        text: 'project_download.label.author',
        value: null,
      },
      ref: {
        text: 'proposal.admin.reference',
        value: null,
      },
      priceEstimation: {
        text: 'proposal.estimation',
        value: null,
      },
      likers: {
        text: 'project_download.label.likers',
        value: null,
      },
      lastActivity: {
        text: 'last-activity',
        value: {
          date: null,
          user: null,
        },
      },
      publishedOn: {
        text: 'published-on',
        value: '2018-06-29 00:00:00',
      },
    },
  ];

  const dataHiddenColumns = [
    {
      title: {
        text: 'Title',
        value: {
          displayTitle: 'Plantation de tulipes dans les jardinière du parking de saint jean',
          url: 'http://google.com',
        },
      },
      implementationPhase: {
        text: 'implementation-phase',
        value: {
          list: [],
          title: null,
        },
      },
      status: { text: 'admin.fields.theme.status', value: null },
      ref: {
        text: null,
        value: null,
      },
      priceEstimation: {
        text: 'proposal.estimation',
        value: null,
      },
      likers: {
        text: 'project_download.label.likers',
        value: null,
      },
      lastActivity: {
        text: 'last-activity',
        value: {
          date: null,
          user: null,
        },
      },
      publishedOn: {
        text: 'published-on',
        value: '2018-06-29 00:00:00',
      },
    },
    {
      title: {
        text: 'Rénovation du gymnase',
        value: { displayTitle: 'Marc', url: 'http://google.com' },
      },
      implementationPhase: {
        text: 'implementation-phase',
        value: {
          list: [],
          title: null,
        },
      },
      status: { text: 'admin.fields.theme.status', value: null },
      ref: {
        text: 'proposal.admin.reference',
        value: null,
      },
      priceEstimation: {
        text: 'proposal.estimation',
        value: null,
      },
      likers: {
        text: 'project_download.label.likers',
        value: null,
      },
      lastActivity: {
        text: 'last-activity',
        value: {
          date: null,
          user: null,
        },
      },
      publishedOn: {
        text: 'published-on',
        value: '2018-06-27 00:00:00',
      },
    },
  ];

  it('renders table with all type of data', () => {
    const wrapper = shallow(<ReactBootstrapTable data={data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders table with hidden columns & N/A th for ref', () => {
    const wrapper = shallow(<ReactBootstrapTable data={dataHiddenColumns} />);
    expect(wrapper).toMatchSnapshot();
  });
});
