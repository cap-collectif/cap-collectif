// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../mocks';
import { ReactBootstrapTable } from './ReactBootstrapTable';

describe('<ProposalCollectStatus />', () => {
  const data = [
    {
      $refType,
      title: {
        text: 'Title',
        value: { displayTitle: 'Jean', url: 'http://google.com' },
        width: '100px'
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
      author: { text: 'project_download.label.author', value: { displayName: 'Jean', media: null, url: 'http://google.com' } },
      ref: {
        text: 'proposal.admin.reference',
        value: '89789',
      },
      priceEstimation: {
        text: 'proposal.estimation',
        value: '347280'
      },
      likers: {
        text: 'project_download.label.likers',
        value: [
          { displayName: 'Maude' },
          { displayName: 'Marie' },
        ],
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
    }
  ];

  it('renders table with all type of data', () => {
    const wrapper = shallow(<ReactBootstrapTable {...data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
