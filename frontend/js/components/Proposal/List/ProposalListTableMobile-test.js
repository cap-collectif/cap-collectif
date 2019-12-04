// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalListTableMobile } from './ProposalListTableMobile';

describe('<ProposalListTableMobile />', () => {
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
            { title: 'After', startAt: '2118-09-27 00:00:00', endAt: '2118-10-27 00:00:00' },
          ],
          title: 'In progress',
        },
        width: '250px',
      },
      status: { text: 'global.status', value: 'my status' },
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
      status: { text: 'global.status', value: null },
    },
  ];

  it('renders correctly', () => {
    const wrapper = shallow(<ProposalListTableMobile data={data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
